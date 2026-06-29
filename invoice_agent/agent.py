import logging
import time
from datetime import datetime

from .config import AgentConfig
from .email_reader import EmailReader, EmailMessage
from .invoice_extractor import InvoiceExtractor
from .invoice_generator import InvoiceGenerator
from .email_sender import EmailSender
from .client_store import ClientStore, ClientTemplate
from .command_parser import CommandParser

logger = logging.getLogger(__name__)


class InvoiceEmailAgent:
    """
    Agent principal de gestion des factures par email.

    Deux modes de traitement :
    1. Email entrant d'un fournisseur/client → extraction + re-génération PDF + envoi
    2. Email de commande du propriétaire → envoi facture mensuelle template ± extras
    """

    def __init__(self, config: AgentConfig):
        self.config = config
        self.reader = EmailReader(config.email_config)
        self.extractor = InvoiceExtractor(config)
        self.generator = InvoiceGenerator(config)
        self.sender = EmailSender(config.email_config, config.company_config)
        self.store = ClientStore(config.client_store_path)
        self.command_parser = CommandParser(
            api_key=config.anthropic_api_key,
            owner_emails=config.owner_emails,
        )
        self._invoice_counter = 1

    def process_once(self) -> int:
        """Traite tous les emails non lus. Retourne le nombre de factures traitées."""
        processed = 0
        try:
            self.reader.connect()
            emails = self.reader.fetch_all_unread()

            for email_msg in emails:
                logger.info(f"Email reçu : '{email_msg.subject}' de {email_msg.sender}")
                handled = self._dispatch(email_msg)
                if handled:
                    self.reader.mark_as_read(email_msg.uid)
                    processed += 1

        except Exception as e:
            logger.error(f"Erreur lors du traitement: {e}", exc_info=True)
        finally:
            self.reader.disconnect()

        return processed

    def run_forever(self):
        interval = self.config.email_config.check_interval_seconds
        logger.info(
            f"Agent démarré — vérification toutes les {interval}s "
            f"sur {self.config.email_config.email_address}"
        )
        while True:
            logger.info(f"[{datetime.now().strftime('%H:%M:%S')}] Vérification boîte mail...")
            count = self.process_once()
            if count:
                logger.info(f"{count} email(s) traité(s).")
            time.sleep(interval)

    # ------------------------------------------------------------------
    # Dispatch
    # ------------------------------------------------------------------

    def _dispatch(self, email_msg: EmailMessage) -> bool:
        # 1. Email de commande du propriétaire ?
        command = self.command_parser.parse(
            subject=email_msg.subject,
            body=email_msg.body_text or email_msg.body_html or "",
            sender=email_msg.sender,
        )
        if command:
            return self._handle_owner_command(command)

        # 2. Email de facture externe (fournisseur)
        subject_lower = email_msg.subject.lower()
        if "facture" in subject_lower or "invoice" in subject_lower:
            return self._handle_incoming_invoice(email_msg)

        return False

    # ------------------------------------------------------------------
    # Commande du propriétaire
    # ------------------------------------------------------------------

    def _handle_owner_command(self, command) -> bool:
        # Cherche le template client
        template = (
            self.store.find_by_email(command.client_email)
            or self.store.find_by_name(command.client_name)
        )

        if command.command_type == "update_template":
            return self._update_template(command, template)

        if not template:
            logger.warning(
                f"Aucun template trouvé pour '{command.client_name}'. "
                "Créez d'abord le client avec manage_clients.py"
            )
            return False

        if command.command_type in ("send_invoice", "add_extras"):
            return self._send_monthly_invoice(template, command)

        return False

    def _update_template(self, command, existing_template) -> bool:
        if existing_template and command.new_base_items:
            existing_template.base_line_items = command.new_base_items
            if command.notes:
                existing_template.notes = command.notes
            self.store.save_template(existing_template)
            logger.info(f"Template mis à jour pour {existing_template.client_name}")
            return True
        logger.warning("update_template : template inexistant ou aucune ligne fournie")
        return False

    def _send_monthly_invoice(self, template: ClientTemplate, command) -> bool:
        invoice = self.store.build_monthly_invoice(
            template=template,
            extras=command.extras,
            invoice_date=command.invoice_date,
            due_date=command.due_date,
        )
        if command.notes:
            invoice.notes = (invoice.notes + " | " + command.notes).strip(" |")

        # Remplit les infos de l'émetteur avec la config entreprise
        company = self.config.company_config
        invoice.supplier_name = company.name
        invoice.supplier_address = company.address
        invoice.supplier_email = company.email or self.config.email_config.email_address

        invoice_number = self._next_invoice_number()
        pdf_path = self.generator.generate(invoice, invoice_number)

        success = self.sender.send_invoice(
            to_address=template.client_email,
            invoice=invoice,
            pdf_path=pdf_path,
            invoice_number=invoice_number,
            cc_address=self.config.email_config.email_address,
        )

        if success:
            extras_info = f" + {len(command.extras)} extra(s)" if command.extras else ""
            logger.info(
                f"Facture mensuelle {invoice_number} envoyée à {template.client_email}"
                f"{extras_info}"
            )
        return success

    # ------------------------------------------------------------------
    # Facture externe entrante
    # ------------------------------------------------------------------

    def _handle_incoming_invoice(self, email_msg: EmailMessage) -> bool:
        invoice = self.extractor.extract(email_msg)
        if not invoice:
            logger.warning(f"Extraction impossible : {email_msg.subject}")
            return False

        invoice_number = self._next_invoice_number()
        pdf_path = self.generator.generate(invoice, invoice_number)

        recipient = invoice.supplier_email or self._extract_email_from_sender(email_msg.sender)
        if not recipient:
            logger.warning(f"Aucun destinataire pour la facture {invoice_number}")
            return False

        return self.sender.send_invoice(
            to_address=recipient,
            invoice=invoice,
            pdf_path=pdf_path,
            invoice_number=invoice_number,
            cc_address=self.config.email_config.email_address,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _next_invoice_number(self) -> str:
        year = datetime.now().strftime("%Y")
        number = f"{self.config.invoice_prefix}-{year}-{self._invoice_counter:04d}"
        self._invoice_counter += 1
        return number

    def _extract_email_from_sender(self, sender: str) -> str:
        if "<" in sender and ">" in sender:
            return sender.split("<")[1].split(">")[0].strip()
        if "@" in sender:
            return sender.strip()
        return ""
