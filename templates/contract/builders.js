const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, PageBreak, Header, Footer, ImageRun,
  TabStopType, TabStopPosition, UnderlineType,
} = require("docx");
const fs = require("fs");
const BRAND = require("../../brand");

const FONT = BRAND.font;
const ORANGE = BRAND.colors.orange;

// ─── Reusable paragraph helpers ────────────────────────────────────────
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({
        text,
        bold: true,
        font: FONT,
        size: level === HeadingLevel.HEADING_1 ? 28 : 24,
        color: ORANGE,
      }),
    ],
  });
}

function bodyText(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 22,
        color: "333333",
        ...options,
      }),
    ],
  });
}

function bulletItem(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [
      new TextRun({ text, font: FONT, size: 22, color: "333333" }),
    ],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 100 }, children: [] });
}

// ─── Section builders ──────────────────────────────────────────────────
const sectionBuilders = {
  cover_page(data) {
    return [
      emptyLine(),
      emptyLine(),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: BRAND.company.toUpperCase(),
            bold: true,
            font: FONT,
            size: 48,
            color: ORANGE,
          }),
        ],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: data.contract_title || "Services Agreement",
            bold: true,
            font: FONT,
            size: 36,
            color: "333333",
          }),
        ],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `Between Tavant and ${data.client_name || "[Client Name]"}`,
            font: FONT,
            size: 24,
            color: "666666",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `Effective Date: ${data.effective_date || "[Date]"}`,
            font: FONT,
            size: 22,
            color: "666666",
          }),
        ],
      }),
      data.contract_number
        ? new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Contract #: ${data.contract_number}`,
                font: FONT,
                size: 22,
                color: "666666",
              }),
            ],
          })
        : emptyLine(),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: BRAND.footer,
            font: FONT,
            size: 18,
            color: "999999",
            italics: true,
          }),
        ],
      }),
    ];
  },

  parties(data) {
    return [
      heading("1. PARTIES"),
      bodyText(`This Agreement is entered into by and between:`),
      emptyLine(),
      bodyText(`Party A (Client):`, { bold: true }),
      bodyText(data.client_name || "[Client Legal Name]"),
      bodyText(data.client_address || "[Client Address]"),
      data.client_contact ? bodyText(`Contact: ${data.client_contact}`) : emptyLine(),
      emptyLine(),
      bodyText(`Party B (Service Provider):`, { bold: true }),
      bodyText(data.tavant_entity || "Tavant Technologies Inc."),
      bodyText(data.tavant_address || "1900 McCarthy Blvd, Suite 200, Milpitas, CA 95035"),
    ];
  },

  scope_of_work(data) {
    const paragraphs = [
      heading("2. SCOPE OF WORK"),
      bodyText("The Service Provider shall provide the following services:"),
      emptyLine(),
    ];
    if (data.services) {
      if (Array.isArray(data.services)) {
        data.services.forEach((s) => paragraphs.push(bulletItem(s)));
      } else {
        paragraphs.push(bodyText(data.services));
      }
    }
    if (data.deliverables) {
      paragraphs.push(emptyLine());
      paragraphs.push(bodyText("Deliverables:", { bold: true }));
      if (Array.isArray(data.deliverables)) {
        data.deliverables.forEach((d) => paragraphs.push(bulletItem(d)));
      } else {
        paragraphs.push(bodyText(data.deliverables));
      }
    }
    if (data.exclusions) {
      paragraphs.push(emptyLine());
      paragraphs.push(bodyText("Exclusions:", { bold: true }));
      if (Array.isArray(data.exclusions)) {
        data.exclusions.forEach((e) => paragraphs.push(bulletItem(e)));
      } else {
        paragraphs.push(bodyText(data.exclusions));
      }
    }
    return paragraphs;
  },

  timeline(data) {
    const paragraphs = [
      heading("3. TIMELINE & MILESTONES"),
      bodyText(`Start Date: ${data.start_date || "[Start Date]"}`),
      bodyText(`End Date: ${data.end_date || "[End Date]"}`),
    ];
    if (data.milestones && Array.isArray(data.milestones)) {
      paragraphs.push(emptyLine());
      paragraphs.push(bodyText("Key Milestones:", { bold: true }));
      data.milestones.forEach((m) => {
        const label = typeof m === "string" ? m : `${m.date || ""} — ${m.description || m.label || ""}`;
        paragraphs.push(bulletItem(label));
      });
    }
    return paragraphs;
  },

  commercial_terms(data) {
    return [
      heading("4. COMMERCIAL TERMS"),
      bodyText(`Total Contract Value: ${data.currency || "USD"} ${data.total_value || "[Amount]"}`),
      emptyLine(),
      bodyText("Payment Schedule:", { bold: true }),
      ...(Array.isArray(data.payment_schedule)
        ? data.payment_schedule.map((p) => bulletItem(typeof p === "string" ? p : `${p.milestone || ""}: ${p.amount || ""}`))
        : [bodyText(data.payment_schedule || "As per milestones")]),
      emptyLine(),
      bodyText(`Payment Terms: ${data.payment_terms || "Net 30 days from invoice date"}`),
    ];
  },

  confidentiality(data) {
    return [
      heading("5. CONFIDENTIALITY"),
      bodyText(
        `Both parties agree to maintain the confidentiality of all proprietary information exchanged during the term of this Agreement and for a period of ${data.confidentiality_period || "2 (two) years"} following termination.`
      ),
      emptyLine(),
      bodyText(
        "Confidential Information includes but is not limited to: technical data, trade secrets, business plans, customer information, financial data, and any information marked as confidential."
      ),
    ];
  },

  ip_rights(data) {
    return [
      heading("6. INTELLECTUAL PROPERTY"),
      bodyText(`IP Ownership: ${data.ip_ownership || "All deliverables created under this Agreement shall be owned by the Client upon full payment."}`),
      emptyLine(),
      bodyText(`License: ${data.license_type || "Tavant retains rights to its pre-existing IP and tools, granting Client a non-exclusive license for use within the project scope."}`),
    ];
  },

  termination(data) {
    return [
      heading("7. TERMINATION"),
      bodyText(`Notice Period: ${data.notice_period || "30 days written notice"}`),
      emptyLine(),
      bodyText("This Agreement may be terminated under the following conditions:", { bold: true }),
      ...(Array.isArray(data.termination_conditions)
        ? data.termination_conditions.map((c) => bulletItem(c))
        : [
            bulletItem("Mutual written agreement of both parties"),
            bulletItem("Material breach not cured within 30 days of written notice"),
            bulletItem("Insolvency or bankruptcy of either party"),
          ]),
    ];
  },

  liability(data) {
    return [
      heading("8. LIABILITY & INDEMNIFICATION"),
      bodyText(`Liability Cap: ${data.liability_cap || "Total liability shall not exceed the total contract value."}`),
      emptyLine(),
      bodyText(`Warranty Period: ${data.warranty_period || "90 days from acceptance of each deliverable."}`),
      emptyLine(),
      bodyText(
        "Each party shall indemnify and hold harmless the other party against claims arising from negligence, willful misconduct, or breach of this Agreement."
      ),
    ];
  },

  general_provisions(data) {
    return [
      heading("9. GENERAL PROVISIONS"),
      bodyText(`Governing Law: ${data.governing_law || "State of California, United States"}`),
      bodyText(`Jurisdiction: ${data.jurisdiction || "Courts of Santa Clara County, California"}`),
      bodyText(`Dispute Resolution: ${data.dispute_resolution || "Binding arbitration under ICC rules"}`),
      emptyLine(),
      bodyText("Force Majeure: Neither party shall be liable for delays caused by events beyond reasonable control, including natural disasters, war, pandemic, or government actions."),
      emptyLine(),
      bodyText("Amendments: Any modification to this Agreement must be made in writing and signed by authorized representatives of both parties."),
    ];
  },

  signatures(data) {
    return [
      heading("10. SIGNATURES"),
      emptyLine(),
      bodyText("IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date."),
      emptyLine(),
      emptyLine(),
      bodyText("For and on behalf of Client:", { bold: true }),
      emptyLine(),
      bodyText("_________________________________"),
      bodyText(`Name: ${data.client_signatory || "[Authorized Signatory]"}`),
      bodyText(`Title: ${data.client_title || "[Title]"}`),
      bodyText("Date: _______________"),
      emptyLine(),
      emptyLine(),
      bodyText("For and on behalf of Tavant:", { bold: true }),
      emptyLine(),
      bodyText("_________________________________"),
      bodyText(`Name: ${data.tavant_signatory || "[Authorized Signatory]"}`),
      bodyText(`Title: ${data.tavant_title || "[Title]"}`),
      bodyText("Date: _______________"),
    ];
  },
};

module.exports = sectionBuilders;
