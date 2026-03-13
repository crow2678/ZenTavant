// MSA (Professional Services Agreement) template section definitions
// Extracted from Tavant MSA-Professional Services Agreement Template
// 12 sections matching the real corporate MSA structure

const SECTIONS = {
  cover_page: {
    id: "cover_page",
    name: "Cover Page",
    description: "MSA title page with Tavant branding, customer name, and effective date",
    fields: ["customer_name", "effective_date"],
  },
  preamble: {
    id: "preamble",
    name: "Preamble",
    description: "Introduction identifying parties (Tavant Technologies Inc. and Customer), addresses, effective date, and governing purpose",
    fields: ["customer_name", "customer_address", "effective_date"],
  },
  definitions: {
    id: "definitions",
    name: "1. Definitions",
    description: "Defined terms: Affiliate, Acceptance, Change Request, Confidential Information, Content, Documentation, IP Rights, Laws, Professional Services, SOW, Work Product, etc.",
    fields: [],
  },
  professional_services: {
    id: "professional_services",
    name: "2. Professional Services",
    description: "Services scope, dates, Tavant personnel, independent contractor status, customer obligations, change order process",
    fields: [],
  },
  acceptance_and_fees: {
    id: "acceptance_and_fees",
    name: "3. Acceptance and Fees",
    description: "Review/acceptance (20-day deemed acceptance), T&M fees, fixed rate fees, expense reimbursement, COLA (max 5%), personnel promotion, late fees (1.5%/month)",
    fields: [],
  },
  ownership: {
    id: "ownership",
    name: "4. Ownership",
    description: "Work Product ownership (Customer owns), Background IP (Tavant owns, grants perpetual license), Residuals, Third Party Materials, proprietary notices",
    fields: [],
  },
  confidentiality: {
    id: "confidentiality",
    name: "5. Confidential Information and Data Protection",
    description: "Nondisclosure obligations, exceptions, PII/privacy, confidentiality of agreement terms, data residency (Azure), use restrictions, audit rights (annual), data deletion (60 days)",
    fields: [],
  },
  warranties: {
    id: "warranties",
    name: "6. Warranties",
    description: "Warranty disclaimer — AS IS, no implied warranties of merchantability/fitness/noninfringement",
    fields: [],
  },
  indemnification: {
    id: "indemnification",
    name: "7. Indemnification and Insurance",
    description: "Mutual indemnification for IP infringement, Tavant options (modify/replace/license/terminate), Customer indemnification, insurance requirements (Workers Comp, CGL, Auto, Umbrella)",
    fields: [],
  },
  limitation_of_liability: {
    id: "limitation_of_liability",
    name: "8. Limitation of Liability",
    description: "No special/incidental/consequential damages, liability cap at 6 months fees, excluded claims at 2x cap",
    fields: [],
  },
  term_and_termination: {
    id: "term_and_termination",
    name: "9. Term and Termination",
    description: "Effective until terminated, 30-day termination notice, material breach cure period (30 days), obligations upon termination (15-day payment, return confidential info, transition support)",
    fields: [],
  },
  general_provisions: {
    id: "general_provisions",
    name: "10. General Provisions",
    description: "Governing law (California/Santa Clara County), compliance, assignment, relationship of parties, non-solicitation (1 year), waiver, survival (Sections 1,7,8,10), force majeure, notices, entire agreement, severability, no publicity",
    fields: [],
  },
  signatures: {
    id: "signatures",
    name: "Signatures",
    description: "Execution block for Tavant Technologies Inc. and Customer with By, Name, Title, Date fields",
    fields: ["customer_name", "customer_signatory", "customer_title", "tavant_signatory", "tavant_title"],
  },
};

module.exports = SECTIONS;
