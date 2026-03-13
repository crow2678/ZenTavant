#!/usr/bin/env node
/**
 * Test: pptx_add_custom_slide + pptx_add_element (creative freedom tools)
 */
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const path = require("path");

(async () => {
  console.log("=== Custom Slide + Element Test ===\n");
  const transport = new StdioClientTransport({ command: "node", args: [path.join(__dirname, "index.js")] });
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(transport);

  // Create presentation
  const pres = await client.callTool({ name: "pptx_create", arguments: { title: "Custom Slide Test", author: "Test" } });
  const pid = JSON.parse(pres.content[0].text).presentation_id;
  console.log("Created presentation:", pid);

  // Add a custom white slide
  const cs1 = await client.callTool({ name: "pptx_add_custom_slide", arguments: { presentation_id: pid, background: "FFFFFF" } });
  const cs1Info = JSON.parse(cs1.content[0].text);
  console.log("Custom slide (white):", cs1Info);

  // Add elements to it
  const el1 = await client.callTool({ name: "pptx_add_element", arguments: {
    presentation_id: pid,
    slide_index: cs1Info.slide_index,
    element_type: "text",
    props: { text: "CREATIVE TITLE", x: 0.5, y: 0.5, w: 12, h: 0.8, fontSize: 36, bold: true, color: "F36E26", fontFace: "Aptos" }
  }});
  console.log("Added title:", JSON.parse(el1.content[0].text));

  const el2 = await client.callTool({ name: "pptx_add_element", arguments: {
    presentation_id: pid,
    slide_index: cs1Info.slide_index,
    element_type: "shape",
    props: { shape: "rect", x: 0.5, y: 1.5, w: 5.5, h: 4.5, fill: "F5F5F5", rectRadius: 0.1 }
  }});
  console.log("Added shape:", JSON.parse(el2.content[0].text));

  const el3 = await client.callTool({ name: "pptx_add_element", arguments: {
    presentation_id: pid,
    slide_index: cs1Info.slide_index,
    element_type: "text",
    props: { text: "Key Insights:\n• AI adoption grew 270% YoY\n• 75+ data scientists on staff\n• Multi-LLM architecture deployed", x: 0.8, y: 1.8, w: 4.9, h: 3.8, fontSize: 16, color: "333333", fontFace: "Aptos", valign: "top" }
  }});
  console.log("Added body text:", JSON.parse(el3.content[0].text));

  // Add a custom dark slide
  const cs2 = await client.callTool({ name: "pptx_add_custom_slide", arguments: { presentation_id: pid, background: "222222" } });
  const cs2Info = JSON.parse(cs2.content[0].text);
  console.log("\nCustom slide (dark):", cs2Info);

  const el4 = await client.callTool({ name: "pptx_add_element", arguments: {
    presentation_id: pid,
    slide_index: cs2Info.slide_index,
    element_type: "text",
    props: { text: "DARK SLIDE WITH FULL CREATIVE CONTROL", x: 0.5, y: 2, w: 12, h: 1, fontSize: 32, bold: true, color: "FF8909", fontFace: "Aptos", align: "center" }
  }});
  console.log("Added dark text:", JSON.parse(el4.content[0].text));

  // Add a chart element
  const el5 = await client.callTool({ name: "pptx_add_element", arguments: {
    presentation_id: pid,
    slide_index: cs2Info.slide_index,
    element_type: "chart",
    props: { x: 2, y: 3.2, w: 9, h: 3, chartType: "bar", data: [{ name: "Revenue", labels: ["Q1", "Q2", "Q3", "Q4"], values: [2.1, 3.4, 5.2, 7.8] }] }
  }});
  console.log("Added chart:", JSON.parse(el5.content[0].text));

  // Export
  const outPath = path.join(__dirname, "output", "Custom_Slide_Test.pptx");
  await client.callTool({ name: "pptx_export", arguments: { presentation_id: pid, output_path: outPath } });
  console.log(`\nExported: ${outPath}`);

  await client.close();
  process.exit(0);
})().catch(e => { console.error("FAILED:", e); process.exit(1); });
