// NDA template section definitions — extracted from Tavant Mutual NDA Template
// 11 sections matching the real corporate NDA structure

const SECTIONS = {
  cover_page: {
    id: "cover_page",
    name: "Cover Page",
    description: "NDA title, parties summary, effective date, and Tavant branding",
    fields: ["nda_title", "company_name", "effective_date"],
  },
  preamble: {
    id: "preamble",
    name: "Preamble",
    description: "Introduction clause identifying parties, addresses, and purpose of the NDA (Business Transactions discussion)",
    fields: ["company_name", "company_address", "effective_date"],
  },
  proprietary_information: {
    id: "proprietary_information",
    name: "1. Proprietary Information",
    description: "Definition of Proprietary Information — product strategy, pricing, financial data, trade secrets, software, customer info, etc. Covers oral, written, and reasonably-identifiable disclosures.",
    fields: ["additional_categories"],
  },
  protection: {
    id: "protection",
    name: "2. Protection",
    description: "Recipient obligations: maintain confidentiality, limit disclosure to need-to-know, use only for Business Transactions evaluation, notify of breaches",
    fields: [],
  },
  exclusions: {
    id: "exclusions",
    name: "3. Exclusions",
    description: "Carve-outs: publicly available info, prior knowledge, third-party disclosure, independent development, legally compelled disclosure (with 10-day notice)",
    fields: [],
  },
  rights: {
    id: "rights",
    name: "4. Rights",
    description: "Proprietary Information remains Discloser's property. Return/destroy obligations within 5 business days. No license granted. Trade secret obligations survive.",
    fields: [],
  },
  legends: {
    id: "legends",
    name: "5. Legends",
    description: "Obligation to preserve restrictive legends, proprietary notices, trademarks, and copyright symbols on all materials",
    fields: [],
  },
  general_terms: {
    id: "general_terms",
    name: "6. General Terms",
    description: "Independent development rights, AS-IS warranty disclaimer, limited obligations, public statement restrictions, name/mark usage prohibition, non-assignment, governing law (California), severability, no-solicitation (12 months), notices",
    fields: ["governing_law"],
  },
  term: {
    id: "term",
    name: "7. Term",
    description: "5-year term from Effective Date, terminable on 30 days notice. Confidentiality obligations survive indefinitely.",
    fields: ["term_years", "notice_days"],
  },
  entire_agreement: {
    id: "entire_agreement",
    name: "8. Entire Agreement",
    description: "Entire agreement clause, counterparts, facsimile signatures, written amendments only",
    fields: [],
  },
  signatures: {
    id: "signatures",
    name: "Signatures",
    description: "Signature blocks for Tavant Technologies Inc. and the Company with name, title, address fields",
    fields: ["company_name", "company_signatory", "company_title", "company_address", "tavant_signatory", "tavant_title"],
  },
};

module.exports = SECTIONS;
