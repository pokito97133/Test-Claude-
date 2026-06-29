import json
import logging
from dataclasses import dataclass, field
from typing import List, Optional

import anthropic

from .config import AgentConfig
from .email_reader import EmailMessage

logger = logging.getLogger(__name__)


@dataclass
class InvoiceLineItem:
    description: str
    quantity: float
    unit_price: float
    vat_rate: float = 20.0
    total_ht: float = 0.0

    def __post_init__(self):
        if self.total_ht == 0.0:
            self.total_ht = round(self.quantity * self.unit_price, 2)


@dataclass
class ExtractedInvoice:
    supplier_name: str
    supplier_address: str
    supplier_email: str
    client_name: str
    client_address: str
    invoice_number: str
    invoice_date: str
    due_date: str
    line_items: List[InvoiceLineItem] = field(default_factory=list)
    total_ht: float = 0.0
    total_vat: float = 0.0
    total_ttc: float = 0.0
    currency: str = "EUR"
    payment_method: str = ""
    notes: str = ""
    raw_email_subject: str = ""
    raw_email_sender: str = ""


EXTRACTION_PROMPT = """Tu es un expert en comptabilité et extraction de données de factures.

Analyse le contenu de cet email et extrait toutes les informations de facturation.

EMAIL OBJET: {subject}
EMAIL EXPÉDITEUR: {sender}

CORPS DE L'EMAIL:
{body}

Retourne UNIQUEMENT un JSON valide avec cette structure exacte (sans markdown, sans explication):
{{
  "supplier_name": "nom du fournisseur/émetteur de la facture",
  "supplier_address": "adresse complète du fournisseur",
  "supplier_email": "email du fournisseur",
  "client_name": "nom du client destinataire",
  "client_address": "adresse du client",
  "invoice_number": "numéro de facture",
  "invoice_date": "date de la facture au format DD/MM/YYYY",
  "due_date": "date d'échéance au format DD/MM/YYYY",
  "line_items": [
    {{
      "description": "description de la prestation ou produit",
      "quantity": 1.0,
      "unit_price": 0.0,
      "vat_rate": 20.0,
      "total_ht": 0.0
    }}
  ],
  "total_ht": 0.0,
  "total_vat": 0.0,
  "total_ttc": 0.0,
  "currency": "EUR",
  "payment_method": "mode de paiement si mentionné",
  "notes": "mentions légales ou notes importantes"
}}

Si une information est absente, utilise une chaîne vide "" pour les textes et 0.0 pour les nombres.
"""


class InvoiceExtractor:
    def __init__(self, config: AgentConfig):
        self.client = anthropic.Anthropic(api_key=config.anthropic_api_key)

    def extract(self, email_msg: EmailMessage) -> Optional[ExtractedInvoice]:
        body = email_msg.body_text or email_msg.body_html or ""

        prompt = EXTRACTION_PROMPT.format(
            subject=email_msg.subject,
            sender=email_msg.sender,
            body=body[:8000],  # limite pour éviter dépassement de contexte
        )

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}],
            )

            raw_json = response.content[0].text.strip()
            # Nettoie les balises markdown si présentes
            if raw_json.startswith("```"):
                raw_json = raw_json.split("```")[1]
                if raw_json.startswith("json"):
                    raw_json = raw_json[4:]

            data = json.loads(raw_json)
            invoice = self._build_invoice(data, email_msg)
            logger.info(f"Facture extraite: {invoice.invoice_number} de {invoice.supplier_name}")
            return invoice

        except Exception as e:
            logger.error(f"Erreur lors de l'extraction de la facture: {e}")
            return None

    def _build_invoice(self, data: dict, email_msg: EmailMessage) -> ExtractedInvoice:
        line_items = []
        for item in data.get("line_items", []):
            line_items.append(InvoiceLineItem(
                description=item.get("description", ""),
                quantity=float(item.get("quantity", 1)),
                unit_price=float(item.get("unit_price", 0)),
                vat_rate=float(item.get("vat_rate", 20)),
                total_ht=float(item.get("total_ht", 0)),
            ))

        return ExtractedInvoice(
            supplier_name=data.get("supplier_name", ""),
            supplier_address=data.get("supplier_address", ""),
            supplier_email=data.get("supplier_email", ""),
            client_name=data.get("client_name", ""),
            client_address=data.get("client_address", ""),
            invoice_number=data.get("invoice_number", ""),
            invoice_date=data.get("invoice_date", ""),
            due_date=data.get("due_date", ""),
            line_items=line_items,
            total_ht=float(data.get("total_ht", 0)),
            total_vat=float(data.get("total_vat", 0)),
            total_ttc=float(data.get("total_ttc", 0)),
            currency=data.get("currency", "EUR"),
            payment_method=data.get("payment_method", ""),
            notes=data.get("notes", ""),
            raw_email_subject=email_msg.subject,
            raw_email_sender=email_msg.sender,
        )
