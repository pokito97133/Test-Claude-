import os
from dataclasses import dataclass


@dataclass
class EmailConfig:
    imap_host: str = os.getenv("IMAP_HOST", "imap.gmail.com")
    imap_port: int = int(os.getenv("IMAP_PORT", "993"))
    smtp_host: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    email_address: str = os.getenv("EMAIL_ADDRESS", "")
    email_password: str = os.getenv("EMAIL_PASSWORD", "")
    check_interval_seconds: int = int(os.getenv("CHECK_INTERVAL", "60"))
    inbox_folder: str = os.getenv("INBOX_FOLDER", "INBOX")


@dataclass
class CompanyConfig:
    name: str = os.getenv("COMPANY_NAME", "Mon Entreprise")
    address: str = os.getenv("COMPANY_ADDRESS", "1 rue de la Paix, 75001 Paris")
    siret: str = os.getenv("COMPANY_SIRET", "000 000 000 00000")
    vat_number: str = os.getenv("COMPANY_VAT", "FR00000000000")
    email: str = os.getenv("COMPANY_EMAIL", "")
    phone: str = os.getenv("COMPANY_PHONE", "")
    logo_path: str = os.getenv("COMPANY_LOGO", "")


@dataclass
class AgentConfig:
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    output_dir: str = os.getenv("OUTPUT_DIR", "./generated_invoices")
    invoice_prefix: str = os.getenv("INVOICE_PREFIX", "FACT")
    default_payment_days: int = int(os.getenv("PAYMENT_DAYS", "30"))
    client_store_path: str = os.getenv("CLIENT_STORE", "./clients.json")
    # Emails du propriétaire autorisés à envoyer des commandes
    owner_emails: list = None
    email_config: EmailConfig = None
    company_config: CompanyConfig = None

    def __post_init__(self):
        if self.email_config is None:
            self.email_config = EmailConfig()
        if self.company_config is None:
            self.company_config = CompanyConfig()
        if self.owner_emails is None:
            raw = os.getenv("OWNER_EMAILS", self.email_config.email_address)
            self.owner_emails = [e.strip() for e in raw.split(",") if e.strip()]
