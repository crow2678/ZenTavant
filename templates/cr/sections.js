// Change Request (CR) template section definitions — extracted from Tavant CR Template
// 8 sections matching the real corporate Change Request form structure

const SECTIONS = {
  cover_page: {
    id: "cover_page",
    name: "Cover Page",
    description: "Dark branded cover with CHANGE REQUEST FORM title, customer name, project name, date, and Tavant address",
    fields: ["customer_name", "project_name", "date"],
  },
  background: {
    id: "background",
    name: "1. Background",
    description: "Legal context: references the original SOW, MSA, Change Order number, parties, and dates",
    fields: ["co_number", "project_name", "customer_name", "sow_date", "msa_date", "extended_end_date"],
  },
  project_details: {
    id: "project_details",
    name: "2. Project Details",
    description: "Table with Original SOW Name, CO number, CO Name, CO Effective Date, Source. Plus sub-sections: Timeline, In Scope, Out of Scope, Assumptions",
    fields: ["co_number", "co_name", "co_effective_date", "project_name", "source", "timeline_description", "in_scope", "out_of_scope", "assumptions"],
  },
  charges: {
    id: "charges",
    name: "3. Charges",
    description: "Table with additional costs for the Change Order and completion date adjustments",
    fields: ["additional_cost", "completion_date"],
  },
  invoicing: {
    id: "invoicing",
    name: "4. Invoicing Details & Billing",
    description: "Invoice timing, tax exclusion note, and bill-to address",
    fields: ["invoice_terms", "bill_to_address"],
  },
  sow_reference: {
    id: "sow_reference",
    name: "5. SOW Cross-Reference",
    description: "Clause adopting specific SOW sections (8, 10, 11) into this Change Request",
    fields: ["sow_sections"],
  },
  counterparts: {
    id: "counterparts",
    name: "6. Counterparts & Execution",
    description: "Legal boilerplate: counterpart execution clause and 'In witness whereof'",
    fields: [],
  },
  signatures: {
    id: "signatures",
    name: "Signatures",
    description: "Side-by-side signature blocks for Tavant Technologies Inc. and Customer with By, Title, Date fields",
    fields: ["customer_name", "customer_signatory", "customer_title", "tavant_signatory", "tavant_title"],
  },
};

module.exports = SECTIONS;
