#!/usr/bin/env python3
"""
Point d'entrée de l'agent de gestion de factures.
Configurer les variables d'environnement dans le fichier .env avant de lancer.
"""
import logging
import sys
from dotenv import load_dotenv

load_dotenv()

from invoice_agent import InvoiceEmailAgent, AgentConfig

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("agent.log"),
    ],
)
logger = logging.getLogger(__name__)


def main():
    config = AgentConfig()

    if not config.anthropic_api_key:
        logger.error("ANTHROPIC_API_KEY manquante. Ajoutez-la dans votre fichier .env")
        sys.exit(1)

    if not config.email_config.email_address or not config.email_config.email_password:
        logger.error("EMAIL_ADDRESS ou EMAIL_PASSWORD manquant. Configurez votre fichier .env")
        sys.exit(1)

    agent = InvoiceEmailAgent(config)

    # Mode one-shot (argument --once) ou boucle continue
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        count = agent.process_once()
        logger.info(f"Traitement terminé : {count} facture(s) traitée(s)")
    else:
        agent.run_forever()


if __name__ == "__main__":
    main()
