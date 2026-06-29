import os
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

from .config import AgentConfig
from .invoice_extractor import ExtractedInvoice

logger = logging.getLogger(__name__)

BLUE_DARK = colors.HexColor("#1a2b5e")
BLUE_LIGHT = colors.HexColor("#e8eef7")
GREY = colors.HexColor("#666666")
BLACK = colors.black
WHITE = colors.white


class InvoiceGenerator:
    def __init__(self, config: AgentConfig):
        self.config = config
        self.company = config.company_config
        os.makedirs(config.output_dir, exist_ok=True)

    def generate(self, invoice: ExtractedInvoice, invoice_number: Optional[str] = None) -> str:
        """Génère un PDF de facture et retourne le chemin du fichier."""
        if not invoice_number:
            invoice_number = self._generate_number()

        filename = f"{invoice_number}.pdf"
        output_path = str(Path(self.config.output_dir) / filename)

        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=15 * mm,
            leftMargin=15 * mm,
            topMargin=15 * mm,
            bottomMargin=15 * mm,
        )

        styles = getSampleStyleSheet()
        story = []

        story.extend(self._build_header(styles, invoice_number))
        story.append(Spacer(1, 6 * mm))
        story.extend(self._build_parties(styles, invoice))
        story.append(Spacer(1, 6 * mm))
        story.extend(self._build_dates(styles, invoice))
        story.append(Spacer(1, 6 * mm))
        story.extend(self._build_line_items(styles, invoice))
        story.append(Spacer(1, 4 * mm))
        story.extend(self._build_totals(styles, invoice))
        story.append(Spacer(1, 6 * mm))
        story.extend(self._build_footer(styles, invoice))

        doc.build(story)
        logger.info(f"Facture PDF générée : {output_path}")
        return output_path

    def _generate_number(self) -> str:
        prefix = self.config.invoice_prefix
        date_str = datetime.now().strftime("%Y%m")
        # Compteur simple basé sur l'heure pour l'unicité
        counter = datetime.now().strftime("%H%M%S")
        return f"{prefix}-{date_str}-{counter}"

    def _build_header(self, styles, invoice_number: str):
        title_style = ParagraphStyle(
            "Title",
            parent=styles["Normal"],
            fontSize=22,
            textColor=BLUE_DARK,
            fontName="Helvetica-Bold",
            spaceAfter=2 * mm,
        )
        sub_style = ParagraphStyle(
            "Sub",
            parent=styles["Normal"],
            fontSize=10,
            textColor=GREY,
        )

        header_data = [
            [
                Paragraph(self.company.name, title_style),
                Paragraph(f"<b>FACTURE</b>", ParagraphStyle(
                    "FTitle", fontSize=18, textColor=BLUE_DARK,
                    fontName="Helvetica-Bold", alignment=TA_RIGHT,
                )),
            ],
            [
                Paragraph(self.company.address, sub_style),
                Paragraph(f"N° {invoice_number}", ParagraphStyle(
                    "FNum", fontSize=10, textColor=GREY, alignment=TA_RIGHT,
                )),
            ],
        ]
        if self.company.email:
            header_data.append([
                Paragraph(self.company.email, sub_style),
                Paragraph("", sub_style),
            ])
        if self.company.siret:
            header_data.append([
                Paragraph(f"SIRET : {self.company.siret}", sub_style),
                Paragraph("", sub_style),
            ])

        table = Table(header_data, colWidths=[100 * mm, 85 * mm])
        table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        return [table, HRFlowable(width="100%", thickness=2, color=BLUE_DARK, spaceAfter=4 * mm)]

    def _build_parties(self, styles, invoice: ExtractedInvoice):
        label_style = ParagraphStyle(
            "Label", fontSize=8, textColor=WHITE, fontName="Helvetica-Bold",
            alignment=TA_CENTER,
        )
        content_style = ParagraphStyle("Content", fontSize=9, textColor=BLACK, leading=14)

        supplier_block = [
            Table(
                [[Paragraph("ÉMETTEUR", label_style)]],
                colWidths=[80 * mm],
                style=TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), BLUE_DARK),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]),
            ),
            Paragraph(f"<b>{invoice.supplier_name}</b>", content_style),
            Paragraph(invoice.supplier_address or "", content_style),
            Paragraph(invoice.supplier_email or "", content_style),
        ]

        client_block = [
            Table(
                [[Paragraph("DESTINATAIRE / CLIENT", label_style)]],
                colWidths=[80 * mm],
                style=TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), BLUE_DARK),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]),
            ),
            Paragraph(f"<b>{invoice.client_name}</b>", content_style),
            Paragraph(invoice.client_address or "", content_style),
        ]

        return [Table(
            [[supplier_block, client_block]],
            colWidths=[95 * mm, 90 * mm],
            style=TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (1, 0), (1, 0), 10),
            ]),
        )]

    def _build_dates(self, styles, invoice: ExtractedInvoice):
        cell_style = ParagraphStyle("Cell", fontSize=9, alignment=TA_CENTER)
        label_style = ParagraphStyle("CLabel", fontSize=8, textColor=GREY, alignment=TA_CENTER)

        data = [
            [
                Paragraph("Date de facture", label_style),
                Paragraph("Date d'échéance", label_style),
                Paragraph("Mode de paiement", label_style),
            ],
            [
                Paragraph(f"<b>{invoice.invoice_date or '-'}</b>", cell_style),
                Paragraph(f"<b>{invoice.due_date or '-'}</b>", cell_style),
                Paragraph(f"<b>{invoice.payment_method or 'Virement'}</b>", cell_style),
            ],
        ]

        table = Table(data, colWidths=[62 * mm, 62 * mm, 61 * mm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BLUE_LIGHT),
            ("BACKGROUND", (0, 1), (-1, 1), WHITE),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.grey),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        return [table]

    def _build_line_items(self, styles, invoice: ExtractedInvoice):
        header_style = ParagraphStyle(
            "TH", fontSize=8, textColor=WHITE, fontName="Helvetica-Bold", alignment=TA_CENTER,
        )
        cell_style = ParagraphStyle("TC", fontSize=9, alignment=TA_LEFT)
        num_style = ParagraphStyle("TN", fontSize=9, alignment=TA_RIGHT)

        headers = ["Description", "Qté", "Prix unit. HT", "TVA %", "Total HT"]
        col_widths = [80 * mm, 18 * mm, 27 * mm, 18 * mm, 27 * mm]

        data = [[Paragraph(h, header_style) for h in headers]]

        for item in invoice.line_items:
            data.append([
                Paragraph(item.description, cell_style),
                Paragraph(str(item.quantity), num_style),
                Paragraph(f"{item.unit_price:.2f} {invoice.currency}", num_style),
                Paragraph(f"{item.vat_rate:.0f}%", num_style),
                Paragraph(f"{item.total_ht:.2f} {invoice.currency}", num_style),
            ])

        if not invoice.line_items:
            data.append([Paragraph("(aucune ligne détectée)", cell_style), "", "", "", ""])

        table = Table(data, colWidths=col_widths, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BLUE_DARK),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, BLUE_LIGHT]),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.grey),
            ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.grey),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        return [table]

    def _build_totals(self, styles, invoice: ExtractedInvoice):
        bold_style = ParagraphStyle("Bold", fontSize=10, fontName="Helvetica-Bold", alignment=TA_RIGHT)
        normal_style = ParagraphStyle("Normal2", fontSize=9, alignment=TA_RIGHT)
        label_style = ParagraphStyle("Label2", fontSize=9, textColor=GREY, alignment=TA_LEFT)

        cur = invoice.currency
        rows = [
            [Paragraph("Total HT :", label_style), Paragraph(f"{invoice.total_ht:.2f} {cur}", normal_style)],
            [Paragraph("TVA :", label_style), Paragraph(f"{invoice.total_vat:.2f} {cur}", normal_style)],
            [Paragraph("TOTAL TTC :", label_style), Paragraph(f"{invoice.total_ttc:.2f} {cur}", bold_style)],
        ]

        # Tableau aligné à droite
        outer = Table(
            [[Table(rows, colWidths=[40 * mm, 40 * mm])]],
            colWidths=[185 * mm],
        )
        outer.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
        ]))

        inner_style = TableStyle([
            ("BOX", (0, 2), (-1, 2), 1, BLUE_DARK),
            ("BACKGROUND", (0, 2), (-1, 2), BLUE_DARK),
            ("TEXTCOLOR", (0, 2), (-1, 2), WHITE),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LINEABOVE", (0, 0), (-1, 0), 0.5, colors.grey),
        ])

        total_table = Table(rows, colWidths=[40 * mm, 40 * mm])
        total_table.setStyle(inner_style)

        wrapper = Table([[total_table]], colWidths=[185 * mm])
        wrapper.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "RIGHT")]))
        return [wrapper]

    def _build_footer(self, styles, invoice: ExtractedInvoice):
        note_style = ParagraphStyle("Note", fontSize=8, textColor=GREY, leading=12)
        parts = []

        if invoice.notes:
            parts.append(Paragraph(f"<b>Mentions :</b> {invoice.notes}", note_style))
            parts.append(Spacer(1, 3 * mm))

        if self.company.vat_number:
            parts.append(Paragraph(f"N° TVA intracommunautaire : {self.company.vat_number}", note_style))

        parts.append(Paragraph(
            "En cas de retard de paiement, des pénalités de 3 fois le taux d'intérêt légal seront appliquées, "
            "ainsi qu'une indemnité forfaitaire de recouvrement de 40 €.",
            note_style,
        ))

        return [HRFlowable(width="100%", thickness=0.5, color=colors.grey, spaceBefore=2 * mm)] + parts
