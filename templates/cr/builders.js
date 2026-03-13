const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle, Header, Footer,
} = require("docx");
const BRAND = require("../../brand");

const FONT = BRAND.font;
const ORANGE = BRAND.colors.orange;

// ─── Reusable helpers ──────────────────────────────────────────────────
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({ text, bold: true, font: FONT, size: level === HeadingLevel.HEADING_1 ? 28 : 24, color: ORANGE }),
    ],
  });
}

function subheading(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, bold: true, font: FONT, size: 22, color: "333333" }),
    ],
  });
}

function bodyText(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text, font: FONT, size: 22, color: "333333", ...options }),
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

// Simple 2-column table for key-value pairs
function kvTable(rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders,
            children: [new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: label, font: FONT, size: 22, bold: true, color: "333333" })],
            })],
          }),
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            borders,
            children: [new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: value || "", font: FONT, size: 22, color: "333333" })],
            })],
          }),
        ],
      })
    ),
  });
}

// ─── Section builders ──────────────────────────────────────────────────
const sectionBuilders = {
  cover_page(data) {
    return [
      emptyLine(), emptyLine(), emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: BRAND.company.toUpperCase(), bold: true, font: FONT, size: 48, color: ORANGE }),
        ],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "CHANGE REQUEST FORM", bold: true, font: FONT, size: 36, color: "333333" }),
        ],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({ text: data.customer_name || "[Customer Name]", font: FONT, size: 28, color: "666666" }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({ text: data.project_name || "[Project Name]", font: FONT, size: 24, color: "666666" }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({ text: data.date || "[Date]", font: FONT, size: 22, color: "666666", italics: true }),
        ],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "3945 Freedom Circle, Suite 600, Santa Clara, CA 95054", font: FONT, size: 18, color: "999999" }),
        ],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: BRAND.footer, font: FONT, size: 18, color: "999999", italics: true }),
        ],
      }),
    ];
  },

  background(data) {
    const coNum = data.co_number || "001";
    return [
      heading(`CHANGE CONTROL CO# ${coNum}`, HeadingLevel.HEADING_2),
      heading("1. Background"),
      bodyText(
        `This Change Order CO# ${coNum}, effective as of ${data.co_effective_date || "[Date]"}, is issued pursuant to that certain Statement of Work titled "${data.project_name || "[Project Name]"}" (the "SOW") entered into between ${data.customer_name || "[Customer Name]"} (hereinafter referred to as "Client" or "Customer") and Tavant Technologies, Inc. ("Tavant").`
      ),
      emptyLine(),
      bodyText(
        `The SOW was entered into on ${data.sow_date || "[SOW Date]"} under the Master Services Agreement ("MSA") dated ${data.msa_date || "[MSA Date]"} between the parties.`
      ),
      emptyLine(),
      bodyText(
        `This Change Order extends/modifies the SOW with a new end date of ${data.extended_end_date || "[Date]"}.`
      ),
    ];
  },

  project_details(data) {
    const coNum = data.co_number || "001";
    const paras = [
      heading("2. Project Details"),
      kvTable([
        ["Original SOW Name", data.project_name || "[Project Name]"],
        ["Change Order Number", `CO# ${coNum}`],
        ["Change Order Name", data.co_name || ""],
        ["Change Order Effective Date", data.co_effective_date || ""],
        ["Source", data.source || "Tavant"],
      ]),
      emptyLine(),
    ];

    // Timeline
    if (data.timeline_description) {
      paras.push(subheading("Timeline"));
      paras.push(bodyText(data.timeline_description));
      paras.push(emptyLine());
    }

    // In Scope
    if (data.in_scope) {
      paras.push(subheading("Additional In Scope Services"));
      const items = Array.isArray(data.in_scope) ? data.in_scope : [data.in_scope];
      items.forEach(item => {
        if (typeof item === "object" && item.category) {
          paras.push(bodyText(item.category, { bold: true }));
          if (item.items && Array.isArray(item.items)) {
            item.items.forEach(sub => paras.push(bulletItem(sub)));
          }
        } else {
          paras.push(bulletItem(String(item)));
        }
      });
      paras.push(emptyLine());
    }

    // Out of Scope
    if (data.out_of_scope) {
      paras.push(subheading("Out of Scope"));
      const items = Array.isArray(data.out_of_scope) ? data.out_of_scope : [data.out_of_scope];
      items.forEach(item => paras.push(bulletItem(String(item))));
      paras.push(emptyLine());
    }

    // Assumptions
    if (data.assumptions) {
      paras.push(subheading("Assumptions"));
      const items = Array.isArray(data.assumptions) ? data.assumptions : [data.assumptions];
      items.forEach(item => paras.push(bulletItem(String(item))));
      paras.push(emptyLine());
    }

    return paras;
  },

  charges(data) {
    return [
      heading("3. Charges"),
      kvTable([
        ["Additional costs for the Change Order", data.additional_cost || "$[Amount]"],
        ["Completion Date adjustments", data.completion_date || "[Date]"],
      ]),
    ];
  },

  invoicing(data) {
    const paras = [
      heading("4. Invoicing Details and Billing Address"),
    ];
    if (data.invoice_terms) {
      const terms = Array.isArray(data.invoice_terms) ? data.invoice_terms : [data.invoice_terms];
      terms.forEach(t => paras.push(bulletItem(String(t))));
    } else {
      paras.push(bulletItem("Invoices shall be submitted upon completion of deliverables."));
      paras.push(bulletItem("All amounts are exclusive of applicable taxes."));
    }
    paras.push(emptyLine());
    paras.push(bodyText(`Bill to Address: ${data.bill_to_address || "[Address]"}`));
    return paras;
  },

  sow_reference(data) {
    const sections = data.sow_sections || "Sections 8, 10 and 11";
    return [
      heading("5. SOW Cross-Reference"),
      bodyText(`${sections} of the SOW are herein adopted in this Change Request.`),
    ];
  },

  counterparts() {
    return [
      heading("6. Counterparts"),
      bodyText(
        `This Change Request may be executed in any number of counterparts, each of which when so executed and delivered shall be deemed an original, and such counterparts together shall constitute one and the same instrument.`
      ),
      emptyLine(),
      bodyText(
        `IN WITNESS WHEREOF, the parties hereto have caused this Change Request to be executed by their respective duly authorized representatives as of the date first written above.`
      ),
    ];
  },

  signatures(data) {
    return [
      heading("SIGNATURES"),
      emptyLine(),
      bodyText("TAVANT TECHNOLOGIES, INC.", { bold: true }),
      emptyLine(),
      bodyText("By: _________________________________"),
      bodyText(`Title: ${data.tavant_title || "________________________"}`),
      bodyText("Date: ___/___/______"),
      emptyLine(), emptyLine(),
      bodyText(data.customer_name || "[CUSTOMER NAME]", { bold: true }),
      emptyLine(),
      bodyText("By: _________________________________"),
      bodyText(`Title: ${data.customer_title || "________________________"}`),
      bodyText("Date: ___/___/______"),
    ];
  },
};

module.exports = sectionBuilders;
