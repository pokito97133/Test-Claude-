import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from pathlib import Path

from .config import EmailConfig, CompanyConfig
from .invoice_extractor import ExtractedInvoice

logger = logging.getLogger(__name__)

EMAIL_TEMPLATE = """Bonjour,

Veuillez trouver ci-joint la facture N° {invoice_number} établie le {invoice_date}.

Détails :
- Montant HT  : {total_ht} {currency}
- TVA         : {total_vat} {currency}
- Montant TTC : {total_ttc} {currency}
- Échéance    : {due_date}

{payment_info}

Cordialement,
{company_name}
{company_email}
{company_phone}
"""


class EmailSender:
    def __init__(self, email_config: EmailConfig, company_config: CompanyConfig):
        self.email_config = email_config
        self.company = company_config

    def send_invoice(
        self,
        to_address: str,
        invoice: ExtractedInvoice,
        pdf_path: str,
        invoice_number: str,
        cc_address: str = "",
    ) -> bool:
        try:
            msg = MIMEMultipart()
            msg["From"] = f"{self.company.name} <{self.email_config.email_address}>"
            msg["To"] = to_address
            msg["Subject"] = f"Facture N° {invoice_number} - {self.company.name}"

            if cc_address:
                msg["Cc"] = cc_address

            payment_info = (
                f"Mode de paiement : {invoice.payment_method}"
                if invoice.payment_method
                else "Mode de paiement : Virement bancaire"
            )

            body = EMAIL_TEMPLATE.format(
                invoice_number=invoice_number,
                invoice_date=invoice.invoice_date or "-",
                total_ht=f"{invoice.total_ht:.2f}",
                total_vat=f"{invoice.total_vat:.2f}",
                total_ttc=f"{invoice.total_ttc:.2f}",
                currency=invoice.currency,
                due_date=invoice.due_date or "-",
                payment_info=payment_info,
                company_name=self.company.name,
                company_email=self.company.email or self.email_config.email_address,
                company_phone=self.company.phone or "",
            )

            msg.attach(MIMEText(body, "plain", "utf-8"))

            # Pièce jointe PDF
            pdf_data = Path(pdf_path).read_bytes()
            attachment = MIMEApplication(pdf_data, _subtype="pdf")
            attachment.add_header(
                "Content-Disposition",
                "attachment",
                filename=Path(pdf_path).name,
            )
            msg.attach(attachment)

            recipients = [to_address]
            if cc_address:
                recipients.append(cc_address)

            with smtplib.SMTP(self.email_config.smtp_host, self.email_config.smtp_port) as server:
                server.ehlo()
                server.starttls()
                server.login(self.email_config.email_address, self.email_config.email_password)
                server.sendmail(self.email_config.email_address, recipients, msg.as_string())

            logger.info(f"Email envoyé à {to_address} avec la facture {invoice_number}")
            return True

        except Exception as e:
            logger.error(f"Erreur envoi email : {e}")
            return False
