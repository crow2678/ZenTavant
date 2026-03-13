// Contract template section definitions
// Each section defines a part of the contract document

const SECTIONS = {
  cover_page: {
    id: "cover_page",
    name: "Cover Page",
    description: "Contract title, parties, effective date, and Tavant branding",
    fields: ["contract_title", "client_name", "effective_date", "contract_number"],
  },
  parties: {
    id: "parties",
    name: "Parties",
    description: "Full legal names, addresses, and roles of contracting parties",
    fields: ["client_name", "client_address", "client_contact", "tavant_entity", "tavant_address"],
  },
  scope_of_work: {
    id: "scope_of_work",
    name: "Scope of Work",
    description: "Detailed description of services, deliverables, and exclusions",
    fields: ["services", "deliverables", "exclusions"],
  },
  timeline: {
    id: "timeline",
    name: "Timeline & Milestones",
    description: "Project phases, milestones, and delivery dates",
    fields: ["start_date", "end_date", "milestones"],
  },
  commercial_terms: {
    id: "commercial_terms",
    name: "Commercial Terms",
    description: "Pricing, payment schedule, invoicing terms",
    fields: ["total_value", "currency", "payment_schedule", "payment_terms"],
  },
  confidentiality: {
    id: "confidentiality",
    name: "Confidentiality & NDA",
    description: "Non-disclosure obligations and data protection terms",
    fields: ["confidentiality_period"],
  },
  ip_rights: {
    id: "ip_rights",
    name: "Intellectual Property",
    description: "IP ownership, licensing, and pre-existing IP provisions",
    fields: ["ip_ownership", "license_type"],
  },
  termination: {
    id: "termination",
    name: "Termination",
    description: "Termination conditions, notice period, and exit obligations",
    fields: ["notice_period", "termination_conditions"],
  },
  liability: {
    id: "liability",
    name: "Liability & Indemnification",
    description: "Liability caps, indemnification, and warranty terms",
    fields: ["liability_cap", "warranty_period"],
  },
  general_provisions: {
    id: "general_provisions",
    name: "General Provisions",
    description: "Governing law, dispute resolution, force majeure, amendments",
    fields: ["governing_law", "jurisdiction", "dispute_resolution"],
  },
  signatures: {
    id: "signatures",
    name: "Signatures",
    description: "Signature blocks for both parties",
    fields: ["client_signatory", "client_title", "tavant_signatory", "tavant_title"],
  },
};

module.exports = SECTIONS;
