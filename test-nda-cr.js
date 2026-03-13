#!/usr/bin/env node
/**
 * Test: NDA + CR template modules
 */
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const path = require("path");

(async () => {
  console.log("=== NDA + CR Template Test ===\n");
  const transport = new StdioClientTransport({ command: "node", args: [path.join(__dirname, "index.js")] });
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(transport);

  // ─── Test NDA ───────────────────────────────────────────
  console.log("--- NDA ---");
  const ndaRes = await client.callTool({ name: "nda_create", arguments: { company_name: "Acme Corp", effective_date: "March 13, 2026" } });
  const ndaId = JSON.parse(ndaRes.content[0].text).nda_id;
  console.log("Created NDA:", ndaId);

  const ndaSections = [
    { section: "cover_page", data: {} },
    { section: "preamble", data: { company_address: "100 Innovation Drive, San Jose, CA 95134" } },
    { section: "proprietary_information", data: {} },
    { section: "protection", data: {} },
    { section: "exclusions", data: {} },
    { section: "rights", data: {} },
    { section: "legends", data: {} },
    { section: "general_terms", data: {} },
    { section: "term", data: { term_years: "5", notice_days: "30" } },
    { section: "entire_agreement", data: {} },
    { section: "signatures", data: { company_signatory: "John Smith", company_title: "VP Engineering", tavant_signatory: "Jane Doe", tavant_title: "SVP Sales" } },
  ];

  for (const s of ndaSections) {
    const r = await client.callTool({ name: "nda_add_section", arguments: { nda_id: ndaId, section: s.section, data: s.data } });
    const info = JSON.parse(r.content[0].text);
    console.log(`  Section ${info.total_sections}: ${s.section}`);
  }

  const ndaOut = path.join(__dirname, "output", "NDA_Test.docx");
  await client.callTool({ name: "nda_export", arguments: { nda_id: ndaId, output_path: ndaOut } });
  console.log(`Exported: ${ndaOut}\n`);

  // ─── Test CR ───────────────────────────────────────────
  console.log("--- Change Request ---");
  const crRes = await client.callTool({ name: "cr_create", arguments: { customer_name: "Global Gaming Inc.", project_name: "AI Customer Service Platform", co_number: "003" } });
  const crId = JSON.parse(crRes.content[0].text).cr_id;
  console.log("Created CR:", crId);

  const crSections = [
    { section: "cover_page", data: { date: "March 2026" } },
    { section: "background", data: { sow_date: "January 15, 2025", msa_date: "December 1, 2024", extended_end_date: "September 30, 2026" } },
    { section: "project_details", data: {
      co_name: "Add Multi-Language Support",
      co_effective_date: "April 1, 2026",
      timeline_description: "The additional scope will be delivered over a 6-month period from April to September 2026.",
      in_scope: [
        { category: "Language Support", items: ["Japanese language model fine-tuning", "Korean language model fine-tuning", "Chinese (Simplified) language model fine-tuning"] },
        { category: "Infrastructure", items: ["Multi-region deployment (APAC)", "Latency optimization for Asian markets"] },
      ],
      out_of_scope: ["Right-to-left language support (Arabic, Hebrew)", "Voice/speech-to-text in new languages", "Training data curation"],
      assumptions: ["Customer provides language-specific QA resources", "Existing AI models support fine-tuning for target languages", "Customer provides sample training data for each language"],
    }},
    { section: "charges", data: { additional_cost: "$450,000", completion_date: "September 30, 2026" } },
    { section: "invoicing", data: {
      invoice_terms: ["50% upon CO execution", "25% upon mid-point delivery milestone", "25% upon final acceptance"],
      bill_to_address: "Global Gaming Inc., 500 Game Way, Tokyo, Japan",
    }},
    { section: "sow_reference", data: {} },
    { section: "counterparts", data: {} },
    { section: "signatures", data: { customer_signatory: "Kenji Tanaka", customer_title: "CTO" } },
  ];

  for (const s of crSections) {
    const r = await client.callTool({ name: "cr_add_section", arguments: { cr_id: crId, section: s.section, data: s.data } });
    const info = JSON.parse(r.content[0].text);
    console.log(`  Section ${info.total_sections}: ${s.section}`);
  }

  const crOut = path.join(__dirname, "output", "CR_Test.docx");
  await client.callTool({ name: "cr_export", arguments: { cr_id: crId, output_path: crOut } });
  console.log(`Exported: ${crOut}\n`);

  console.log("=== All tests passed ===");
  await client.close();
  process.exit(0);
})().catch(e => { console.error("FAILED:", e); process.exit(1); });
