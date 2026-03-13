const { Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");
const BRAND = require("../../brand");

const FONT = BRAND.font;
const ORANGE = BRAND.colors.orange;

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
  return heading(text, HeadingLevel.HEADING_2);
}

function bodyText(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: FONT, size: 22, color: "333333", ...options })],
  });
}

function bulletItem(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: FONT, size: 22, color: "333333" })],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 100 }, children: [] });
}

const sectionBuilders = {
  cover_page(data) {
    return [
      emptyLine(), emptyLine(), emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: BRAND.company.toUpperCase(), bold: true, font: FONT, size: 48, color: ORANGE })],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Statement of Work", bold: true, font: FONT, size: 36, color: "333333" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: data.sow_title || data.project_name || "[Project Name]", font: FONT, size: 28, color: "666666" })],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `Prepared for: ${data.client_name || "[Client]"}`, font: FONT, size: 22, color: "666666" })],
      }),
      data.sow_number ? new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `SOW #: ${data.sow_number}`, font: FONT, size: 22, color: "666666" })],
      }) : emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `Date: ${data.effective_date || "[Date]"}`, font: FONT, size: 22, color: "666666" })],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: BRAND.footer, font: FONT, size: 18, color: "999999", italics: true })],
      }),
    ];
  },

  overview(data) {
    const paragraphs = [heading("1. PROJECT OVERVIEW")];
    if (data.background) {
      paragraphs.push(subheading("1.1 Background"));
      paragraphs.push(bodyText(data.background));
    }
    if (data.objectives) {
      paragraphs.push(subheading("1.2 Objectives"));
      if (Array.isArray(data.objectives)) {
        data.objectives.forEach((o) => paragraphs.push(bulletItem(o)));
      } else {
        paragraphs.push(bodyText(data.objectives));
      }
    }
    if (data.success_criteria) {
      paragraphs.push(subheading("1.3 Success Criteria"));
      if (Array.isArray(data.success_criteria)) {
        data.success_criteria.forEach((c) => paragraphs.push(bulletItem(c)));
      } else {
        paragraphs.push(bodyText(data.success_criteria));
      }
    }
    return paragraphs;
  },

  scope(data) {
    const paragraphs = [heading("2. SCOPE OF WORK")];
    if (data.work_packages) {
      paragraphs.push(subheading("2.1 Work Packages"));
      if (Array.isArray(data.work_packages)) {
        data.work_packages.forEach((wp) => {
          if (typeof wp === "string") {
            paragraphs.push(bulletItem(wp));
          } else {
            paragraphs.push(bodyText(wp.name || "", { bold: true }));
            paragraphs.push(bodyText(wp.description || ""));
          }
        });
      } else {
        paragraphs.push(bodyText(data.work_packages));
      }
    }
    if (data.in_scope) {
      paragraphs.push(subheading("2.2 In Scope"));
      (Array.isArray(data.in_scope) ? data.in_scope : [data.in_scope]).forEach((s) => paragraphs.push(bulletItem(s)));
    }
    if (data.out_of_scope) {
      paragraphs.push(subheading("2.3 Out of Scope"));
      (Array.isArray(data.out_of_scope) ? data.out_of_scope : [data.out_of_scope]).forEach((s) => paragraphs.push(bulletItem(s)));
    }
    return paragraphs;
  },

  approach(data) {
    const paragraphs = [heading("3. APPROACH & METHODOLOGY")];
    if (data.methodology) paragraphs.push(bodyText(`Methodology: ${data.methodology}`));
    if (data.technologies) {
      paragraphs.push(subheading("3.1 Technologies"));
      (Array.isArray(data.technologies) ? data.technologies : [data.technologies]).forEach((t) => paragraphs.push(bulletItem(t)));
    }
    if (data.tools) {
      paragraphs.push(subheading("3.2 Tools"));
      (Array.isArray(data.tools) ? data.tools : [data.tools]).forEach((t) => paragraphs.push(bulletItem(t)));
    }
    if (data.team_structure) paragraphs.push(emptyLine(), bodyText(data.team_structure));
    return paragraphs;
  },

  deliverables(data) {
    const paragraphs = [heading("4. DELIVERABLES")];
    if (Array.isArray(data.deliverables)) {
      data.deliverables.forEach((d, i) => {
        if (typeof d === "string") {
          paragraphs.push(bulletItem(d));
        } else {
          paragraphs.push(bodyText(`${i + 1}. ${d.name || d.title || ""}`, { bold: true }));
          if (d.description) paragraphs.push(bodyText(d.description));
          if (d.acceptance_criteria) paragraphs.push(bodyText(`Acceptance: ${d.acceptance_criteria}`, { italics: true, color: "666666" }));
          paragraphs.push(emptyLine());
        }
      });
    }
    return paragraphs;
  },

  timeline(data) {
    const paragraphs = [heading("5. TIMELINE & PHASES")];
    if (Array.isArray(data.phases)) {
      data.phases.forEach((phase, i) => {
        if (typeof phase === "string") {
          paragraphs.push(bulletItem(phase));
        } else {
          paragraphs.push(bodyText(`Phase ${i + 1}: ${phase.name || ""}`, { bold: true }));
          if (phase.duration) paragraphs.push(bodyText(`Duration: ${phase.duration}`));
          if (phase.description) paragraphs.push(bodyText(phase.description));
          if (phase.deliverables) {
            (Array.isArray(phase.deliverables) ? phase.deliverables : [phase.deliverables])
              .forEach((d) => paragraphs.push(bulletItem(d)));
          }
          paragraphs.push(emptyLine());
        }
      });
    }
    return paragraphs;
  },

  team(data) {
    const paragraphs = [heading("6. TEAM & RESOURCES")];
    if (Array.isArray(data.roles)) {
      data.roles.forEach((role) => {
        if (typeof role === "string") {
          paragraphs.push(bulletItem(role));
        } else {
          paragraphs.push(bodyText(`${role.title || role.role || ""}`, { bold: true }));
          if (role.count) paragraphs.push(bodyText(`Count: ${role.count}`));
          if (role.responsibilities) paragraphs.push(bodyText(`Responsibilities: ${role.responsibilities}`));
          paragraphs.push(emptyLine());
        }
      });
    }
    return paragraphs;
  },

  pricing(data) {
    const paragraphs = [
      heading("7. PRICING & ESTIMATES"),
      bodyText(`Pricing Model: ${data.pricing_model || "Time & Materials"}`),
      bodyText(`Currency: ${data.currency || "USD"}`),
    ];
    if (data.rate_card && Array.isArray(data.rate_card)) {
      paragraphs.push(subheading("7.1 Rate Card"));
      data.rate_card.forEach((r) => {
        paragraphs.push(bulletItem(`${r.role || ""}: ${r.rate || ""}/hr`));
      });
    }
    if (data.total_estimate) {
      paragraphs.push(emptyLine());
      paragraphs.push(bodyText(`Total Estimate: ${data.currency || "USD"} ${data.total_estimate}`, { bold: true }));
    }
    return paragraphs;
  },

  assumptions(data) {
    const paragraphs = [heading("8. ASSUMPTIONS & DEPENDENCIES")];
    if (data.assumptions) {
      paragraphs.push(subheading("8.1 Assumptions"));
      (Array.isArray(data.assumptions) ? data.assumptions : [data.assumptions]).forEach((a) => paragraphs.push(bulletItem(a)));
    }
    if (data.dependencies) {
      paragraphs.push(subheading("8.2 Dependencies"));
      (Array.isArray(data.dependencies) ? data.dependencies : [data.dependencies]).forEach((d) => paragraphs.push(bulletItem(d)));
    }
    if (data.risks) {
      paragraphs.push(subheading("8.3 Risks"));
      (Array.isArray(data.risks) ? data.risks : [data.risks]).forEach((r) => {
        if (typeof r === "string") {
          paragraphs.push(bulletItem(r));
        } else {
          paragraphs.push(bulletItem(`${r.risk || ""} — Mitigation: ${r.mitigation || ""}`));
        }
      });
    }
    return paragraphs;
  },

  governance(data) {
    const paragraphs = [heading("9. GOVERNANCE & COMMUNICATION")];
    if (data.meetings && Array.isArray(data.meetings)) {
      paragraphs.push(subheading("9.1 Meeting Cadence"));
      data.meetings.forEach((m) => {
        if (typeof m === "string") {
          paragraphs.push(bulletItem(m));
        } else {
          paragraphs.push(bulletItem(`${m.type || ""}: ${m.frequency || ""} — ${m.participants || ""}`));
        }
      });
    }
    if (data.reporting) paragraphs.push(subheading("9.2 Reporting"), bodyText(data.reporting));
    if (data.escalation_path) paragraphs.push(subheading("9.3 Escalation"), bodyText(data.escalation_path));
    return paragraphs;
  },

  acceptance(data) {
    return [
      heading("10. ACCEPTANCE CRITERIA"),
      bodyText(`Acceptance Process: ${data.acceptance_process || "Client review and written sign-off within the review period."}`),
      bodyText(`Review Period: ${data.review_period || "5 business days from deliverable submission."}`),
    ];
  },

  signatures(data) {
    return [
      heading("11. SIGNATURES"),
      emptyLine(),
      bodyText("IN WITNESS WHEREOF, the parties agree to the scope and terms described in this Statement of Work."),
      emptyLine(), emptyLine(),
      bodyText("For and on behalf of Client:", { bold: true }),
      emptyLine(),
      bodyText("_________________________________"),
      bodyText(`Name: ${data.client_signatory || "[Authorized Signatory]"}`),
      bodyText(`Title: ${data.client_title || "[Title]"}`),
      bodyText("Date: _______________"),
      emptyLine(), emptyLine(),
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
