"""
Analyse les emails de commande envoyés par le propriétaire.
Permet d'ajouter des extras, de modifier un template ou de déclencher
l'envoi mensuel d'une facture via un simple email.

Formats d'email reconnus (objet) :
  - [FACTURE] Client: Dupont SARL
  - [TEMPLATE] Client: Dupont SARL
  - [EXTRAS] Client: Dupont SARL
"""
import json
import logging
from dataclasses import dataclass, field
from typing import List, Optional

import anthropic

from .invoice_extractor import InvoiceLineItem

logger = logging.getLogger(__name__)


@dataclass
class ParsedCommand:
    command_type: str           # "send_invoice" | "update_template" | "add_extras"
    client_name: str
    client_email: str
    extras: List[InvoiceLineItem] = field(default_factory=list)
    new_base_items: List[dict] = field(default_factory=list)
    invoice_date: str = ""
    due_date: str = ""
    notes: str = ""
    raw_instruction: str = ""


COMMAND_PROMPT = """Tu es un assistant de facturation. Analyse cet email envoyé par le propriétaire de l'entreprise.

OBJET: {subject}
CORPS: {body}

Détermine l'intention et extrait les données. Retourne UNIQUEMENT un JSON valide:

{{
  "command_type": "send_invoice" | "update_template" | "add_extras",
  "client_name": "nom exact du client",
  "client_email": "email du client si mentionné",
  "invoice_date": "DD/MM/YYYY ou vide",
  "due_date": "DD/MM/YYYY ou vide",
  "notes": "remarques ou conditions particulières",
  "extras": [
    {{
      "description": "description du service supplémentaire",
      "quantity": 1.0,
      "unit_price": 0.0,
      "vat_rate": 20.0,
      "total_ht": 0.0
    }}
  ],
  "new_base_items": []
}}

Règles:
- "send_invoice" : demande d'envoyer la facture mensuelle au client (avec ou sans extras)
- "update_template" : modifier les lignes de base du template client
- "add_extras" : ajouter des lignes supplémentaires à la prochaine facture
- Si le corps contient une liste de prestations/prix, les mettre dans extras
- Si total_ht n'est pas précisé, calcule quantity × unit_price
"""


class CommandParser:
    def __init__(self, api_key: str, owner_emails: List[str]):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.owner_emails = [e.lower() for e in owner_emails]

    def is_owner_email(self, sender: str) -> bool:
        sender_lower = sender.lower()
        return any(owner in sender_lower for owner in self.owner_emails)

    def parse(self, subject: str, body: str, sender: str) -> Optional[ParsedCommand]:
        if not self.is_owner_email(sender):
            return None

        # Vérifie que c'est bien une commande (objet avec balise ou mots-clés)
        subject_lower = subject.lower()
        is_command = any(kw in subject_lower for kw in [
            "[facture]", "[template]", "[extras]", "[invoice]",
            "facture mensuelle", "extras client", "modifier template",
        ])
        if not is_command:
            return None

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                messages=[{"role": "user", "content": COMMAND_PROMPT.format(
                    subject=subject,
                    body=body[:4000],
                )}],
            )
            raw = response.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            data = json.loads(raw)

            extras = []
            for item in data.get("extras", []):
                li = InvoiceLineItem(
                    description=item.get("description", ""),
                    quantity=float(item.get("quantity", 1)),
                    unit_price=float(item.get("unit_price", 0)),
                    vat_rate=float(item.get("vat_rate", 20)),
                    total_ht=float(item.get("total_ht", 0)),
                )
                if li.total_ht == 0:
                    li.total_ht = round(li.quantity * li.unit_price, 2)
                extras.append(li)

            return ParsedCommand(
                command_type=data.get("command_type", "send_invoice"),
                client_name=data.get("client_name", ""),
                client_email=data.get("client_email", ""),
                extras=extras,
                new_base_items=data.get("new_base_items", []),
                invoice_date=data.get("invoice_date", ""),
                due_date=data.get("due_date", ""),
                notes=data.get("notes", ""),
                raw_instruction=body,
            )

        except Exception as e:
            logger.error(f"Erreur parsing commande : {e}")
            return None
