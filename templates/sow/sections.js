const SECTIONS = {
  cover_page: {
    id: "cover_page",
    name: "Cover Page",
    description: "SOW title, project name, parties, and dates",
    fields: ["sow_title", "project_name", "client_name", "sow_number", "effective_date"],
  },
  overview: {
    id: "overview",
    name: "Project Overview",
    description: "High-level summary of the project, objectives, and business context",
    fields: ["background", "objectives", "success_criteria"],
  },
  scope: {
    id: "scope",
    name: "Scope of Work",
    description: "Detailed work packages, in-scope items, and out-of-scope items",
    fields: ["work_packages", "in_scope", "out_of_scope"],
  },
  approach: {
    id: "approach",
    name: "Approach & Methodology",
    description: "Development methodology, tools, technologies, and team structure",
    fields: ["methodology", "technologies", "tools", "team_structure"],
  },
  deliverables: {
    id: "deliverables",
    name: "Deliverables",
    description: "List of deliverables with acceptance criteria",
    fields: ["deliverables"],
  },
  timeline: {
    id: "timeline",
    name: "Timeline & Phases",
    description: "Project phases with durations and milestones",
    fields: ["phases"],
  },
  team: {
    id: "team",
    name: "Team & Resources",
    description: "Team composition, roles, and resource allocation",
    fields: ["roles"],
  },
  pricing: {
    id: "pricing",
    name: "Pricing & Estimates",
    description: "Cost breakdown, rate card, and total estimate",
    fields: ["pricing_model", "rate_card", "total_estimate", "currency"],
  },
  assumptions: {
    id: "assumptions",
    name: "Assumptions & Dependencies",
    description: "Project assumptions, dependencies, and risks",
    fields: ["assumptions", "dependencies", "risks"],
  },
  governance: {
    id: "governance",
    name: "Governance & Communication",
    description: "Reporting structure, meeting cadence, escalation path",
    fields: ["meetings", "reporting", "escalation_path"],
  },
  acceptance: {
    id: "acceptance",
    name: "Acceptance Criteria",
    description: "Definition of done, acceptance process, and sign-off",
    fields: ["acceptance_process", "review_period"],
  },
  signatures: {
    id: "signatures",
    name: "Signatures",
    description: "Sign-off blocks for both parties",
    fields: ["client_signatory", "client_title", "tavant_signatory", "tavant_title"],
  },
};

module.exports = SECTIONS;
