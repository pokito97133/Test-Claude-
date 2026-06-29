"""
Gestion des factures de référence (templates) par client.
Chaque client a une facture de base stockée en JSON.
"""
import json
import logging
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, List, Optional

from .invoice_extractor import InvoiceLineItem, ExtractedInvoice

logger = logging.getLogger(__name__)


@dataclass
class ClientTemplate:
    client_id: str                          # identifiant unique (ex: "dupont-sarl")
    client_name: str
    client_address: str
    client_email: str
    base_line_items: List[dict] = field(default_factory=list)  # lignes de base mensuelles
    default_payment_method: str = "Virement bancaire"
    default_payment_days: int = 30
    notes: str = ""


class ClientStore:
    """Persistance JSON des templates clients."""

    def __init__(self, store_path: str = "./clients.json"):
        self.store_path = Path(store_path)
        self._data: Dict[str, dict] = {}
        self._load()

    def _load(self):
        if self.store_path.exists():
            self._data = json.loads(self.store_path.read_text(encoding="utf-8"))
        else:
            self._data = {}

    def _save(self):
        self.store_path.write_text(
            json.dumps(self._data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def save_template(self, template: ClientTemplate):
        self._data[template.client_id] = asdict(template)
        self._save()
        logger.info(f"Template client sauvegardé : {template.client_id}")

    def get_template(self, client_id: str) -> Optional[ClientTemplate]:
        data = self._data.get(client_id)
        if not data:
            return None
        return ClientTemplate(**data)

    def find_by_name(self, name: str) -> Optional[ClientTemplate]:
        """Recherche approximative par nom de client."""
        name_lower = name.lower()
        for cid, data in self._data.items():
            if name_lower in data.get("client_name", "").lower():
                return ClientTemplate(**data)
        return None

    def find_by_email(self, email: str) -> Optional[ClientTemplate]:
        email_lower = email.lower()
        for cid, data in self._data.items():
            if data.get("client_email", "").lower() == email_lower:
                return ClientTemplate(**data)
        return None

    def list_all(self) -> List[ClientTemplate]:
        return [ClientTemplate(**d) for d in self._data.values()]

    def delete(self, client_id: str) -> bool:
        if client_id in self._data:
            del self._data[client_id]
            self._save()
            return True
        return False

    def build_monthly_invoice(
        self,
        template: ClientTemplate,
        extras: List[InvoiceLineItem] = None,
        invoice_date: str = "",
        due_date: str = "",
    ) -> ExtractedInvoice:
        """Construit une facture mensuelle à partir du template + extras éventuels."""
        from datetime import datetime, timedelta

        if not invoice_date:
            invoice_date = datetime.now().strftime("%d/%m/%Y")
        if not due_date:
            days = template.default_payment_days
            due_dt = datetime.now() + timedelta(days=days)
            due_date = due_dt.strftime("%d/%m/%Y")

        # Lignes de base
        base_items = [
            InvoiceLineItem(
                description=item["description"],
                quantity=float(item.get("quantity", 1)),
                unit_price=float(item.get("unit_price", 0)),
                vat_rate=float(item.get("vat_rate", 20)),
                total_ht=float(item.get("total_ht", 0)),
            )
            for item in template.base_line_items
        ]

        all_items = base_items + (extras or [])

        total_ht = sum(i.total_ht for i in all_items)
        # TVA moyenne pondérée simplifiée
        total_vat = sum(i.total_ht * i.vat_rate / 100 for i in all_items)
        total_ttc = total_ht + total_vat

        return ExtractedInvoice(
            supplier_name="",           # sera rempli par la config entreprise
            supplier_address="",
            supplier_email="",
            client_name=template.client_name,
            client_address=template.client_address,
            invoice_number="",
            invoice_date=invoice_date,
            due_date=due_date,
            line_items=all_items,
            total_ht=round(total_ht, 2),
            total_vat=round(total_vat, 2),
            total_ttc=round(total_ttc, 2),
            currency="EUR",
            payment_method=template.default_payment_method,
            notes=template.notes,
        )
