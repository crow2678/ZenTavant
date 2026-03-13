#!/usr/bin/env node
/**
 * Test: MSA (Professional Services Agreement) template — all 13 sections
 */
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const path = require("path");

(async () => {
  console.log("=== MSA Template Test ===\n");
  const transport = new StdioClientTransport({ command: "node", args: [path.join(__dirname, "index.js")] });
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(transport);

  const res = await client.callTool({ name: "msa_create", arguments: { customer_name: "Global Gaming Inc.", effective_date: "March 15, 2026" } });
  const msaId = JSON.parse(res.content[0].text).msa_id;
  console.log("Created MSA:", msaId);

  const sections = [
    { section: "cover_page", data: {} },
    { section: "preamble", data: { customer_address: "500 Game Way, San Francisco, CA 94105" } },
    { section: "definitions", data: {} },
    { section: "professional_services", data: {} },
    { section: "acceptance_and_fees", data: {} },
    { section: "ownership", data: {} },
    { section: "confidentiality", data: {} },
    { section: "warranties", data: {} },
    { section: "indemnification", data: {} },
    { section: "limitation_of_liability", data: {} },
    { section: "term_and_termination", data: {} },
    { section: "general_provisions", data: {} },
    { section: "signatures", data: { customer_signatory: "James Wilson", customer_title: "CEO", tavant_signatory: "Sami Muneer", tavant_title: "CEO" } },
  ];

  for (const s of sections) {
    const r = await client.callTool({ name: "msa_add_section", arguments: { msa_id: msaId, section: s.section, data: s.data } });
    const info = JSON.parse(r.content[0].text);
    console.log(`  Section ${info.total_sections}: ${s.section}`);
  }

  const outPath = path.join(__dirname, "output", "MSA_Test.docx");
  await client.callTool({ name: "msa_export", arguments: { msa_id: msaId, output_path: outPath } });
  console.log(`\nExported: ${outPath}`);
  console.log(`Total sections: ${sections.length}`);

  await client.close();
  process.exit(0);
})().catch(e => { console.error("FAILED:", e); process.exit(1); });
