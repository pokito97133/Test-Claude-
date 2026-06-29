import logging
import time
from datetime import datetime

from .config import AgentConfig
from .email_reader import EmailReader
from .invoice_extractor import InvoiceExtractor
from .invoice_generator import InvoiceGenerator
from .email_sender import EmailSender

logger = logging.getLogger(__name__)


class InvoiceEmailAgent:
    """
    Agent principal qui surveille la boîte mail, extrait les factures,
    génère un PDF propre et renvoie la facture par email.
    """

    def __init__(self, config: AgentConfig):
        self.config = config
        self.reader = EmailReader(config.email_config)
        self.extractor = InvoiceExtractor(config)
        self.generator = InvoiceGenerator(config)
        self.sender = EmailSender(config.email_config, config.company_config)
        self._invoice_counter = 1

    def process_once(self) -> int:
        """Traite les emails non lus. Retourne le nombre de factures traitées."""
        processed = 0
        try:
            self.reader.connect()
            emails = self.reader.fetch_unread_invoice_emails()

            for email_msg in emails:
                logger.info(f"Traitement : {email_msg.subject} (de {email_msg.sender})")

                invoice = self.extractor.extract(email_msg)
                if not invoice:
                    logger.warning(f"Impossible d'extraire la facture de : {email_msg.subject}")
                    continue

                invoice_number = self._next_invoice_number()
                pdf_path = self.generator.generate(invoice, invoice_number)

                # Détermine le destinataire : l'expéditeur original ou le client extrait
                recipient = invoice.supplier_email or self._extract_email_from_sender(email_msg.sender)

                if not recipient:
                    logger.warning(f"Aucun destinataire trouvé pour la facture {invoice_number}")
                    # On marque quand même l'email comme lu pour éviter la boucle
                    self.reader.mark_as_read(email_msg.uid)
                    continue

                success = self.sender.send_invoice(
                    to_address=recipient,
                    invoice=invoice,
                    pdf_path=pdf_path,
                    invoice_number=invoice_number,
                    cc_address=self.config.email_config.email_address,  # copie à soi-même
                )

                if success:
                    self.reader.mark_as_read(email_msg.uid)
                    processed += 1
                    logger.info(f"Facture {invoice_number} traitée et envoyée a {recipient}")

        except Exception as e:
            logger.error(f"Erreur lors du traitement: {e}", exc_info=True)
        finally:
            self.reader.disconnect()

        return processed

    def run_forever(self):
        """Boucle infinie : vérifie la boîte mail toutes les N secondes."""
        interval = self.config.email_config.check_interval_seconds
        logger.info(
            f"Agent démarré. Vérification toutes les {interval}s. "
            f"Email surveillé : {self.config.email_config.email_address}"
        )

        while True:
            logger.info(f"[{datetime.now().strftime('%H:%M:%S')}] Vérification de la boîte mail...")
            count = self.process_once()
            if count:
                logger.info(f"{count} facture(s) traitée(s) avec succès.")
            time.sleep(interval)

    def _next_invoice_number(self) -> str:
        year = datetime.now().strftime("%Y")
        number = f"{self.config.invoice_prefix}-{year}-{self._invoice_counter:04d}"
        self._invoice_counter += 1
        return number

    def _extract_email_from_sender(self, sender: str) -> str:
        """Extrait l'adresse email depuis un champ From (ex: 'John Doe <john@example.com>')."""
        if "<" in sender and ">" in sender:
            return sender.split("<")[1].split(">")[0].strip()
        if "@" in sender:
            return sender.strip()
        return ""
