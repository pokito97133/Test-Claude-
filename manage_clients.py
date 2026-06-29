#!/usr/bin/env python3
"""
Script CLI pour gérer les templates de factures clients.
Usage:
  python manage_clients.py list
  python manage_clients.py add
  python manage_clients.py show <client_id>
  python manage_clients.py delete <client_id>
"""
import json
import sys
from dotenv import load_dotenv

load_dotenv()

from invoice_agent.client_store import ClientStore, ClientTemplate
from invoice_agent.config import AgentConfig


def cmd_list(store: ClientStore):
    clients = store.list_all()
    if not clients:
        print("Aucun client enregistré.")
        return
    print(f"\n{'ID':<25} {'Nom':<30} {'Email':<35} {'Lignes de base'}")
    print("-" * 100)
    for c in clients:
        print(f"{c.client_id:<25} {c.client_name:<30} {c.client_email:<35} {len(c.base_line_items)} ligne(s)")


def cmd_add(store: ClientStore):
    print("\n=== Nouveau client ===")
    client_id = input("ID unique (ex: dupont-sarl) : ").strip()
    name = input("Nom du client : ").strip()
    address = input("Adresse : ").strip()
    email_addr = input("Email : ").strip()
    payment_method = input("Mode de paiement [Virement bancaire] : ").strip() or "Virement bancaire"
    payment_days_raw = input("Délai de paiement en jours [30] : ").strip()
    payment_days = int(payment_days_raw) if payment_days_raw.isdigit() else 30
    notes = input("Mentions/notes : ").strip()

    print("\n--- Lignes de base (prestations récurrentes mensuelles) ---")
    print("(Laisser 'description' vide pour terminer)\n")
    base_items = []
    while True:
        desc = input(f"  Ligne {len(base_items)+1} - Description : ").strip()
        if not desc:
            break
        qty = float(input("    Quantité : ").strip() or "1")
        price = float(input("    Prix unitaire HT (€) : ").strip() or "0")
        vat = float(input("    TVA % [20] : ").strip() or "20")
        total_ht = round(qty * price, 2)
        base_items.append({
            "description": desc,
            "quantity": qty,
            "unit_price": price,
            "vat_rate": vat,
            "total_ht": total_ht,
        })
        print(f"    → Total HT : {total_ht:.2f} €\n")

    template = ClientTemplate(
        client_id=client_id,
        client_name=name,
        client_address=address,
        client_email=email_addr,
        base_line_items=base_items,
        default_payment_method=payment_method,
        default_payment_days=payment_days,
        notes=notes,
    )
    store.save_template(template)
    print(f"\nClient '{name}' enregistré avec {len(base_items)} ligne(s) de base.")


def cmd_show(store: ClientStore, client_id: str):
    t = store.get_template(client_id)
    if not t:
        print(f"Client '{client_id}' introuvable.")
        return
    print(f"\n{'='*50}")
    print(f"ID          : {t.client_id}")
    print(f"Nom         : {t.client_name}")
    print(f"Adresse     : {t.client_address}")
    print(f"Email       : {t.client_email}")
    print(f"Paiement    : {t.default_payment_method} ({t.default_payment_days}j)")
    print(f"Notes       : {t.notes}")
    print(f"\nLignes de base :")
    for i, item in enumerate(t.base_line_items, 1):
        print(f"  {i}. {item['description']} — {item['quantity']} × {item['unit_price']}€ HT = {item['total_ht']}€ HT (TVA {item['vat_rate']}%)")


def cmd_delete(store: ClientStore, client_id: str):
    confirm = input(f"Supprimer '{client_id}' ? (oui/non) : ").strip().lower()
    if confirm == "oui":
        if store.delete(client_id):
            print(f"Client '{client_id}' supprimé.")
        else:
            print(f"Client '{client_id}' introuvable.")


def main():
    config = AgentConfig()
    store = ClientStore(config.client_store_path)

    args = sys.argv[1:]
    if not args or args[0] == "list":
        cmd_list(store)
    elif args[0] == "add":
        cmd_add(store)
    elif args[0] == "show" and len(args) > 1:
        cmd_show(store, args[1])
    elif args[0] == "delete" and len(args) > 1:
        cmd_delete(store, args[1])
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
