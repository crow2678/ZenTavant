#!/usr/bin/env node

/**
 * End-to-end test for Tavant Docs MCP Server.
 * Tests all 3 document types: PPTX, Contract, SOW.
 * Run: node test-e2e.js
 */

const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const path = require("path");

const SERVER_PATH = path.join(__dirname, "index.js");

async function main() {
  console.log("=== Tavant Docs MCP — End-to-End Test ===\n");

  const transport = new StdioClientTransport({ command: "node", args: [SERVER_PATH] });
  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
  console.log("Server connected.\n");

  // List all tools
  const tools = await client.listTools();
  console.log(`Found ${tools.tools.length} tools: ${tools.tools.map((t) => t.name).join(", ")}\n`);

  // ─── TEST 1: PPTX ──────────────────────────────────────────────────
  console.log("━━━ TEST 1: PowerPoint Presentation ━━━\n");

  const pres = await client.callTool({ name: "pptx_create", arguments: { title: "Test Deck", author: "Tester" } });
  const presId = JSON.parse(pres.content[0].text).presentation_id;
  console.log(`Created presentation: ${presId}`);

  for (const s of [
    { layout: "title_cover", data: { title: "Test Deck", subtitle: "E2E Test" } },
    { layout: "agenda", data: { title: "Agenda", items: ["Item 1", "Item 2", "Item 3"] } },
    { layout: "bullet_content", data: { title: "Key Points", bullets: ["Point A", "Point B"] } },
    { layout: "stats_kpis", data: { title: "Metrics", stats: [{ value: "99%", label: "Uptime" }, { value: "50K", label: "Users" }] } },
    { layout: "thank_you", data: { title: "Thanks", contact_name: "Test User", contact_email: "test@tavant.com" } },
  ]) {
    await client.callTool({ name: "pptx_add_slide", arguments: { presentation_id: presId, ...s } });
    console.log(`  + ${s.layout}`);
  }

  const pptxOut = path.join(__dirname, "output", "TEST_deck.pptx");
  await client.callTool({ name: "pptx_export", arguments: { presentation_id: presId, output_path: pptxOut } });
  console.log(`Exported: ${pptxOut}\n`);

  // ─── TEST 2: Contract ───────────────────────────────────────────────
  console.log("━━━ TEST 2: Contract Document ━━━\n");

  const con = await client.callTool({
    name: "contract_create",
    arguments: { contract_title: "Master Services Agreement", client_name: "Acme Corp", effective_date: "March 15, 2026" },
  });
  const conId = JSON.parse(con.content[0].text).contract_id;
  console.log(`Created contract: ${conId}`);

  for (const s of [
    { section: "cover_page", data: { contract_number: "TAV-2026-001" } },
    { section: "parties", data: { client_address: "123 Main St, New York, NY", tavant_entity: "Tavant Technologies Inc." } },
    { section: "scope_of_work", data: {
      services: ["AI/ML Platform Development", "Data Pipeline Engineering", "MLOps Setup"],
      deliverables: ["AI Platform v1.0", "Data Lake Architecture", "CI/CD Pipeline for ML Models"],
      exclusions: ["Hardware procurement", "Third-party license costs"],
    }},
    { section: "commercial_terms", data: { total_value: "500,000", currency: "USD", payment_terms: "Net 30" } },
    { section: "confidentiality", data: { confidentiality_period: "3 years" } },
    { section: "ip_rights", data: {} },
    { section: "termination", data: { notice_period: "60 days" } },
    { section: "liability", data: { liability_cap: "Not to exceed total contract value" } },
    { section: "general_provisions", data: { governing_law: "State of California" } },
    { section: "signatures", data: { client_signatory: "John Smith", client_title: "CTO", tavant_signatory: "Jane Doe", tavant_title: "VP Delivery" } },
  ]) {
    await client.callTool({ name: "contract_add_section", arguments: { contract_id: conId, ...s } });
    console.log(`  + ${s.section}`);
  }

  const conOut = path.join(__dirname, "output", "TEST_contract.docx");
  await client.callTool({ name: "contract_export", arguments: { contract_id: conId, output_path: conOut } });
  console.log(`Exported: ${conOut}\n`);

  // ─── TEST 3: SOW ───────────────────────────────────────────────────
  console.log("━━━ TEST 3: Statement of Work ━━━\n");

  const sowRes = await client.callTool({
    name: "sow_create",
    arguments: { project_name: "AI Chatbot Platform", client_name: "GlobalBank Inc", effective_date: "April 1, 2026" },
  });
  const sowId = JSON.parse(sowRes.content[0].text).sow_id;
  console.log(`Created SOW: ${sowId}`);

  for (const s of [
    { section: "cover_page", data: { sow_number: "SOW-2026-042" } },
    { section: "overview", data: {
      background: "GlobalBank requires an AI-powered chatbot to handle 80% of tier-1 customer support queries.",
      objectives: ["Reduce support ticket volume by 60%", "Achieve 90% customer satisfaction", "Go live within 6 months"],
      success_criteria: ["Chatbot handles 80% of tier-1 queries", "Average response time under 3 seconds", "CSAT score above 4.2/5"],
    }},
    { section: "scope", data: {
      work_packages: [
        { name: "NLP Model Development", description: "Fine-tune LLM for banking domain" },
        { name: "Integration Layer", description: "Connect chatbot to core banking APIs" },
        { name: "Admin Dashboard", description: "Build monitoring and training interface" },
      ],
      in_scope: ["Chatbot development", "API integration", "Testing", "Deployment to production"],
      out_of_scope: ["Infrastructure hosting costs", "Core banking system modifications"],
    }},
    { section: "approach", data: {
      methodology: "Agile Scrum with 2-week sprints",
      technologies: ["Python", "LangChain", "React", "PostgreSQL", "AWS"],
      tools: ["Jira", "Confluence", "GitHub", "AWS SageMaker"],
    }},
    { section: "deliverables", data: {
      deliverables: [
        { name: "NLP Model v1", description: "Domain-trained chatbot model", acceptance_criteria: "90% accuracy on test dataset" },
        { name: "Chatbot API", description: "REST API for chatbot interactions", acceptance_criteria: "All endpoints pass integration tests" },
        { name: "Admin Dashboard", description: "Web UI for monitoring and retraining", acceptance_criteria: "UAT sign-off from client" },
      ],
    }},
    { section: "timeline", data: {
      phases: [
        { name: "Discovery & Design", duration: "4 weeks", deliverables: ["Requirements doc", "Architecture design"] },
        { name: "Development Sprint 1-3", duration: "6 weeks", deliverables: ["NLP Model v1", "Chatbot API"] },
        { name: "Development Sprint 4-6", duration: "6 weeks", deliverables: ["Admin Dashboard", "Integration testing"] },
        { name: "UAT & Go-Live", duration: "4 weeks", deliverables: ["Production deployment", "Handover documentation"] },
      ],
    }},
    { section: "team", data: {
      roles: [
        { role: "Project Manager", count: 1, responsibilities: "Overall delivery, client communication" },
        { role: "ML Engineer", count: 2, responsibilities: "NLP model development and fine-tuning" },
        { role: "Full Stack Developer", count: 2, responsibilities: "API and dashboard development" },
        { role: "QA Engineer", count: 1, responsibilities: "Testing and quality assurance" },
      ],
    }},
    { section: "pricing", data: {
      pricing_model: "Fixed Price",
      currency: "USD",
      total_estimate: "380,000",
      rate_card: [
        { role: "Project Manager", rate: "150" },
        { role: "ML Engineer", rate: "175" },
        { role: "Full Stack Developer", rate: "150" },
        { role: "QA Engineer", rate: "120" },
      ],
    }},
    { section: "assumptions", data: {
      assumptions: ["Client provides access to existing support ticket data", "AWS environment is provisioned by client"],
      dependencies: ["Core banking API documentation available by Week 2", "Client SME available for weekly reviews"],
      risks: [
        { risk: "Data quality issues in training data", mitigation: "Early data audit in discovery phase" },
        { risk: "API rate limits on core banking", mitigation: "Implement caching and fallback mechanisms" },
      ],
    }},
    { section: "governance", data: {
      meetings: [
        { type: "Daily Standup", frequency: "Daily", participants: "Dev team" },
        { type: "Sprint Review", frequency: "Bi-weekly", participants: "All stakeholders" },
        { type: "Steering Committee", frequency: "Monthly", participants: "Leadership" },
      ],
      reporting: "Weekly status report via email every Friday",
      escalation_path: "PM → Delivery Head → VP Engineering",
    }},
    { section: "acceptance", data: { review_period: "5 business days" } },
    { section: "signatures", data: { client_signatory: "Robert Chen", client_title: "SVP Technology", tavant_signatory: "Priya Sharma", tavant_title: "VP Delivery" } },
  ]) {
    await client.callTool({ name: "sow_add_section", arguments: { sow_id: sowId, ...s } });
    console.log(`  + ${s.section}`);
  }

  const sowOut = path.join(__dirname, "output", "TEST_sow.docx");
  await client.callTool({ name: "sow_export", arguments: { sow_id: sowId, output_path: sowOut } });
  console.log(`Exported: ${sowOut}\n`);

  // ─── Done ──────────────────────────────────────────────────────────
  console.log("━━━ ALL TESTS PASSED ━━━\n");
  console.log("Output files:");
  console.log(`  PPTX:     ${pptxOut}`);
  console.log(`  Contract: ${conOut}`);
  console.log(`  SOW:      ${sowOut}`);

  await client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
