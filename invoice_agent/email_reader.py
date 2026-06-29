import imaplib
import email
import logging
from email.header import decode_header
from typing import List, Optional
from dataclasses import dataclass, field

from .config import EmailConfig

logger = logging.getLogger(__name__)


@dataclass
class EmailMessage:
    uid: str
    sender: str
    subject: str
    body_text: str
    body_html: str
    attachments: List[dict] = field(default_factory=list)  # {"filename": str, "data": bytes, "content_type": str}


class EmailReader:
    def __init__(self, config: EmailConfig):
        self.config = config
        self._connection: Optional[imaplib.IMAP4_SSL] = None

    def connect(self):
        self._connection = imaplib.IMAP4_SSL(self.config.imap_host, self.config.imap_port)
        self._connection.login(self.config.email_address, self.config.email_password)
        logger.info("Connecté à la boîte mail IMAP")

    def disconnect(self):
        if self._connection:
            try:
                self._connection.logout()
            except Exception:
                pass
            self._connection = None

    def fetch_unread_invoice_emails(self) -> List[EmailMessage]:
        """Récupère les emails non lus qui semblent contenir des factures."""
        if not self._connection:
            self.connect()

        self._connection.select(self.config.inbox_folder)

        # Recherche emails non lus avec mots-clés facture
        _, uids_facture = self._connection.search(None, '(UNSEEN SUBJECT "facture")')
        _, uids_invoice = self._connection.search(None, '(UNSEEN SUBJECT "invoice")')

        all_uids = set()
        for uid_list in [uids_facture, uids_invoice]:
            if uid_list[0]:
                all_uids.update(uid_list[0].split())

        messages = []
        for uid in all_uids:
            msg = self._fetch_message(uid)
            if msg:
                messages.append(msg)

        logger.info(f"{len(messages)} email(s) de facture non lu(s) trouvé(s)")
        return messages

    def _fetch_message(self, uid: bytes) -> Optional[EmailMessage]:
        _, data = self._connection.fetch(uid, "(RFC822)")
        if not data or not data[0]:
            return None

        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)

        subject = self._decode_header_value(msg.get("Subject", ""))
        sender = self._decode_header_value(msg.get("From", ""))
        body_text, body_html, attachments = self._extract_parts(msg)

        return EmailMessage(
            uid=uid.decode(),
            sender=sender,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            attachments=attachments,
        )

    def mark_as_read(self, uid: str):
        self._connection.store(uid.encode(), "+FLAGS", "\\Seen")

    def _decode_header_value(self, value: str) -> str:
        parts = decode_header(value)
        decoded = []
        for part, charset in parts:
            if isinstance(part, bytes):
                decoded.append(part.decode(charset or "utf-8", errors="replace"))
            else:
                decoded.append(part)
        return " ".join(decoded)

    def _extract_parts(self, msg: email.message.Message):
        body_text = ""
        body_html = ""
        attachments = []

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))

                if "attachment" in content_disposition:
                    filename = part.get_filename()
                    if filename:
                        attachments.append({
                            "filename": self._decode_header_value(filename),
                            "data": part.get_payload(decode=True),
                            "content_type": content_type,
                        })
                elif content_type == "text/plain" and not body_text:
                    body_text = part.get_payload(decode=True).decode("utf-8", errors="replace")
                elif content_type == "text/html" and not body_html:
                    body_html = part.get_payload(decode=True).decode("utf-8", errors="replace")
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body_text = payload.decode("utf-8", errors="replace")

        return body_text, body_html, attachments
