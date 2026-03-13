const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell,
  WidthType, Header, Footer,
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

function bodyText(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    indent: options.indent ? { left: options.indent } : undefined,
    children: [
      new TextRun({ text, font: FONT, size: 22, color: "333333", ...options }),
    ],
  });
}

function numberedClause(number, text) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `(${number}) `, font: FONT, size: 22, color: "333333" }),
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
          new TextRun({ text: data.nda_title || "MUTUAL NON-DISCLOSURE AGREEMENT", bold: true, font: FONT, size: 36, color: "333333" }),
        ],
      }),
      emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `Between Tavant Technologies, Inc. and ${data.company_name || "[Company Name]"}`, font: FONT, size: 24, color: "666666" }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `Effective Date: ${data.effective_date || "[Date]"}`, font: FONT, size: 22, color: "666666" }),
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

  preamble(data) {
    return [
      heading("MUTUAL NON-DISCLOSURE AGREEMENT"),
      bodyText(
        `This Mutual Non-Disclosure Agreement is made and entered into as of ${data.effective_date || "[Date]"} by and between Tavant Technologies, Inc., with an office at 3945 Freedom Circle, Suite 600, Santa Clara, CA 95054 ("Tavant"), and ${data.company_name || "[Company Name]"}, with an office at ${data.company_address || "[Company Address]"} (the "Company").`
      ),
      emptyLine(),
      bodyText(
        `Tavant and the Company may be discussing or evaluating possible business transactions (the "Business Transactions"). In connection with these discussions, each party may disclose or has disclosed, certain Proprietary Information (as hereinafter defined), which it desires to be used only for the limited purpose for which disclosed. The parties also wish to agree as to the making of public statements or reports regarding the Business Transactions.`
      ),
      emptyLine(),
      bodyText(
        `The party receiving Proprietary Information is referred to herein as "Recipient" and the party disclosing Proprietary Information is referred to herein as "Discloser".`
      ),
    ];
  },

  proprietary_information(data) {
    const paras = [
      heading("1. Proprietary Information"),
      bodyText(
        `For purposes of this Agreement, "Proprietary Information" of a party shall mean:`
      ),
      numberedClause("i", "information disclosed by such party relating to product development strategy and activity, marketing strategy, corporate assessments and strategic plans, pricing, financial and statistical information, accounting information, identity of suppliers, software, systems, processes, formulae, inventions, discoveries, policies, guidelines, procedures, practices, disputes or litigation,"),
      numberedClause("ii", "confidential, proprietary or trade secret information orally disclosed by such party and identified as such on the date of its first disclosure, with a written summary thereof provided to Recipient within thirty (30) days of disclosure,"),
      numberedClause("iii", "confidential, proprietary or trade secret information disclosed by such party that is clearly and conspicuously identified in writing as such at the time of its first disclosure,"),
      numberedClause("iv", "confidential, proprietary or trade secret information disclosed by such party, which a reasonable person employed in the services industry would recognize as such,"),
      numberedClause("v", "information disclosed by such party relating to employees, contractors or customers which, if released, would cause an unlawful invasion of privacy, and"),
      numberedClause("vi", "any compilation or summary of information or data that contains or is based on Proprietary Information."),
      emptyLine(),
      bodyText(
        `For purposes of this Agreement, and without limiting the generality of the foregoing, the parties acknowledge and agree that (A) all Proprietary Information disclosed by a party shall be deemed to be the Proprietary Information of such party, including, but not limited to, third-party confidential, proprietary or trade secret information that such party is obligated to protect, and (B) information shall be deemed to be disclosed by a party if such information is disclosed by any of its partners, affiliates, officers, employees, directors, contractors, agents or representatives or is otherwise disclosed on behalf of such party.`
      ),
    ];
    return paras;
  },

  protection() {
    return [
      heading("2. Protection"),
      bodyText("Recipient agrees to:"),
      numberedClause("i", "receive Proprietary Information disclosed hereunder in confidence,"),
      numberedClause("ii", "use reasonable efforts to maintain the confidentiality of such Proprietary Information and not disclose such Proprietary Information to third parties (except for Recipient's partners, affiliates, representatives, agents and contractors who have a need to know, are under a duty of non-disclosure with respect to such information, and are acting for the sole benefit of Recipient), which efforts shall accord such Proprietary Information at least the same level of protection against unauthorized use and disclosure that Recipient customarily accords to its own information of a similar nature,"),
      numberedClause("iii", "use or permit the use of such Proprietary Information solely in accordance with the terms of this Agreement for the discussion and/or evaluation of the Business Transactions, and"),
      numberedClause("iv", "promptly notify Discloser in writing of any actual or suspected loss or unauthorized use, disclosure or access of Discloser's Proprietary Information of which it becomes aware, and take all steps reasonably requested by Discloser to limit, stop or otherwise prevent such loss or unauthorized use, disclosure or access."),
    ];
  },

  exclusions() {
    return [
      heading("3. Exclusions"),
      bodyText("The restrictions on use and disclosure set forth above shall not apply when and to the extent that the Proprietary Information:"),
      numberedClause("i", "is or becomes generally available to the public;"),
      numberedClause("ii", "was previously rightfully known to Recipient free of any obligation to keep it confidential;"),
      numberedClause("iii", "is subsequently disclosed to Recipient by a third party who may rightfully transfer and disclose such information without restriction and free of any obligation to keep it confidential;"),
      numberedClause("iv", "is independently developed by Recipient without reference to Discloser's Proprietary Information, or"),
      numberedClause("v", "is required to be disclosed by Recipient by applicable law, provided that Recipient uses all reasonable efforts to provide Discloser with at least ten (10) days' prior notice of such disclosure and Recipient discloses only that portion of the Proprietary Information that is legally required to be furnished pursuant to the opinion of legal counsel of Recipient."),
    ];
  },

  rights() {
    return [
      heading("4. Rights"),
      bodyText(
        `All Proprietary Information disclosed by one party to the other in connection with this Agreement shall be deemed to be the property of Discloser or the appropriate third-party owner, as the case may be. Except as Recipient reasonably requires, to accomplish the purposes provided herein, Recipient shall not reproduce such Proprietary Information, in whole or in part, without written authorization of Discloser.`
      ),
      emptyLine(),
      bodyText(
        `At the conclusion of the discussions between the parties or within five (5) business days of Discloser's earlier request, Recipient shall cease use of all Proprietary Information received hereunder and shall, pursuant to Discloser's instructions, and at Discloser's sole discretion: (i) return it to Discloser; and/or, (ii) destroy all tangible or retrievable materials embodying such Proprietary Information.`
      ),
      emptyLine(),
      bodyText(
        `If Discloser elects to require Recipient to destroy rather than return Proprietary Information, Recipient will provide Discloser, at Discloser's request, with an affidavit affirming that such Proprietary Information has been permanently and completely destroyed. However, machine-readable archival copies of Proprietary Information need only be destroyed in due course and Recipient's auditors or legal counsel may retain one (1) copy of Proprietary Information for the sole purpose of establishing what Proprietary Information has been received.`
      ),
      emptyLine(),
      bodyText(
        `Except as expressly provided herein, Discloser grants no license under any copyright, patent, trademark, trade secret or other intellectual property right by disclosure of Proprietary Information. As to any Proprietary Information that the Discloser maintains as a trade secret, the Recipient's obligations under Section 2 will remain in effect for as long such Proprietary Information remains a trade secret, and such obligations will survive termination or expiration of this Agreement.`
      ),
    ];
  },

  legends() {
    return [
      heading("5. Legends"),
      bodyText(
        `Each party agrees that it shall abide by and reproduce and include any restrictive legend or proprietary rights notice that appears in or on any Proprietary Information of the other party (or any third-party owner) that it is authorized to reproduce. Each party also agrees that it shall not remove, alter, cover or distort any trademark, trade name, copyright or other proprietary rights notices, legends, symbols or labels appearing on or in any Proprietary Information of the other party (or any third-party owner).`
      ),
    ];
  },

  general_terms(data) {
    return [
      heading("6. General Terms"),
      emptyLine(),
      bodyText("6.1 Independent Development and Marketing", { bold: true }),
      bodyText(
        `Discloser understands that Recipient or third parties may have performed substantial independent development relating to Discloser's Proprietary Information. Neither this Agreement nor receipt of Proprietary Information hereunder shall limit either party's independent development and marketing of products or systems involving technology or ideas similar to those disclosed nor will this Agreement or receipt of Proprietary Information hereunder prevent either party from undertaking similar efforts or discussions with third parties, including competitors of the other party.`
      ),
      emptyLine(),
      bodyText("6.2 No Warranties", { bold: true }),
      bodyText(
        `DISCLOSER PROVIDES INFORMATION SOLELY ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND or duty to update or correct. Each party understands that portions of Proprietary Information may relate to products or services that are under development or planned for development by Discloser or a third party. Discloser does not warrant or represent that it will or will not introduce any product or service to which Proprietary Information disclosed herein is related.`
      ),
      emptyLine(),
      bodyText("6.3 Limited Obligations", { bold: true }),
      bodyText(
        `Other than the obligations set forth herein, neither party shall have any further obligations to the other unless and until a definitive written agreement is executed. Neither party will be required to negotiate nor enter into any other agreements or arrangements with the other party, whether or not related to the Business Transactions. This Agreement does not create any agency or partnership relationship.`
      ),
      emptyLine(),
      bodyText("6.4 Public Statements; Use of Name", { bold: true }),
      bodyText(
        `Neither party shall make, deliver or publish any public statements or descriptions of the Business Transactions (including statements that a Business Transaction is being discussed) without the prior written consent of the other party. Either party may provide disclosures as required by law. Neither party shall use the name or marks of the other for advertising or any other purposes without the prior written approval of the other party.`
      ),
      emptyLine(),
      bodyText("6.5 No Assignment", { bold: true }),
      bodyText(
        `Neither this Agreement nor any rights or obligations hereunder shall be assignable, delegable or otherwise transferable in whole or in part by either party.`
      ),
      emptyLine(),
      bodyText("6.6 Governing Law; Severability", { bold: true }),
      bodyText(
        `This Agreement shall be governed by the laws of ${data.governing_law || "California"}, exclusive of its conflict of laws principles. If any provision of this Agreement is held to be void or unenforceable, in whole or in part, the other provisions of this Agreement shall continue to be valid and the parties shall replace the void or unenforceable provision with one that is valid and enforceable and most nearly approximates their original intentions.`
      ),
      emptyLine(),
      bodyText("6.7 No Solicitation", { bold: true }),
      bodyText(
        `Each party shall not, without the other's prior written consent solicit and/or hire (on a consulting basis or otherwise) any employee, contractor or agent (which does not include professional advisors such as attorneys, accountants and the like) of the other party until after the expiration of twelve months from the termination of such person's relationship with such party.`
      ),
      emptyLine(),
      bodyText("6.8 Notices", { bold: true }),
      bodyText(
        `All notices, requests, demands, and other communications (other than routine operational communications) required or permitted hereunder shall be in writing and shall be deemed to have been received by a party (i) when actually received in the case of hand delivery against a signed receipt, (ii) two (2) business days after being given to a reputable overnight courier, or (iii) upon receipt when mailed by first class mail, postage prepaid, and addressed to such party at its address set forth herein.`
      ),
    ];
  },

  term(data) {
    const years = data.term_years || "5";
    const noticeDays = data.notice_days || "30";
    return [
      heading("7. Term"),
      bodyText(
        `This Agreement shall remain in full force and effect for a period of ${years} (${years === "5" ? "five" : years}) years from the Effective Date unless sooner terminated at any time by either party by giving at least ${noticeDays} (${noticeDays === "30" ? "thirty" : noticeDays}) days prior written notice to the other party.`
      ),
      emptyLine(),
      bodyText(
        `Notwithstanding the foregoing, the Receiving Party's duties and obligations of security and confidentiality with respect to Confidential Information shall survive the termination or expiration of this Agreement and remain in effect indefinitely.`
      ),
    ];
  },

  entire_agreement() {
    return [
      heading("8. Entire Agreement"),
      bodyText(
        `This instrument expresses the entire understanding of the parties, and supersedes all prior oral or written agreements, commitments and understandings, with respect to the subject matter hereof. This Agreement may be executed in one or more counterparts, each of which when so executed and delivered shall be an original and all of which together shall constitute one and the same instrument. Facsimile signatures are deemed to be equivalent to original signatures for purposes of this Agreement.`
      ),
      emptyLine(),
      bodyText(
        `No modification, amendment or waiver of any term or condition of this Agreement shall be binding upon a party unless it is in writing and is executed by the party against whom such modification, amendment or waiver is sought to be enforced.`
      ),
    ];
  },

  signatures(data) {
    return [
      heading("SIGNATURES"),
      bodyText("IN WITNESS WHEREOF, the parties hereto have executed this Agreement, which shall be effective as of the date first written above."),
      emptyLine(), emptyLine(),
      bodyText("Tavant Technologies, Inc.", { bold: true }),
      emptyLine(),
      bodyText("By: _________________________________"),
      bodyText(`Name: ${data.tavant_signatory || "________________________"}`),
      bodyText(`Title: ${data.tavant_title || "________________________"}`),
      bodyText("Address: 3945 Freedom Circle, Suite 600, Santa Clara, CA 95054"),
      emptyLine(), emptyLine(),
      bodyText(data.company_name || "[Company Name]", { bold: true }),
      emptyLine(),
      bodyText("By: _________________________________"),
      bodyText(`Name: ${data.company_signatory || "________________________"}`),
      bodyText(`Title: ${data.company_title || "________________________"}`),
      bodyText(`Address: ${data.company_address || "________________________"}`),
    ];
  },
};

module.exports = sectionBuilders;
