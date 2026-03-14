#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");
const BRAND = require("./brand");

// ─── Template modules ──────────────────────────────────────────────────
const pptx = require("./templates/pptx/register");
const contract = require("./templates/contract/register");
const sow = require("./templates/sow/register");
const nda = require("./templates/nda/register");
const cr = require("./templates/cr/register");
const msa = require("./templates/msa/register");

// ─── Knowledge base ────────────────────────────────────────────────────
const KNOWLEDGE_DIR = path.join(__dirname, "knowledge");

function loadKnowledge() {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith(".md"));
  const knowledge = {};
  for (const file of files) {
    const name = file.replace(".md", "");
    knowledge[name] = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), "utf-8");
  }
  return knowledge;
}

// ─── MCP Server ────────────────────────────────────────────────────────
const server = new McpServer({
  name: "tavant-docs",
  version: "1.0.0",
});

// Global tool: brand guidelines
server.tool(
  "get_brand_guidelines",
  "Get Tavant brand guidelines (colors, fonts, layout rules) and list all available document types",
  {},
  async () => ({
    content: [{
      type: "text",
      text: JSON.stringify({
        brand: "Tavant",
        primary_color: `#${BRAND.colors.orange} (Orange)`,
        backgrounds: { dark: `#${BRAND.colors.darkBg}`, white: `#${BRAND.colors.white}` },
        font: BRAND.font,
        footer: BRAND.footer,
        document_types: {
          pptx: "PowerPoint — PREFERRED: pptx_generate (one-shot). Also: pptx_add_slide, pptx_add_custom_slide + pptx_add_elements",
          contract: "Contract .docx — PREFERRED: contract_generate (one-shot). Also: contract_create/add_section/export",
          sow: "SOW .docx — PREFERRED: sow_generate (one-shot). Also: sow_create/add_section/export",
          nda: "NDA .docx — PREFERRED: nda_generate (one-shot). Also: nda_create/add_section/export",
          cr: "CR .docx — PREFERRED: cr_generate (one-shot). Also: cr_create/add_section/export",
          msa: "MSA .docx — PREFERRED: msa_generate (one-shot). Also: msa_create/add_section/export",
        },
        guidelines: [
          "Every document uses Tavant branding: orange #F36E26, Aptos font",
          "Presentations: start with title_cover, end with thank_you",
          "Contracts: include at minimum parties, scope_of_work, commercial_terms, signatures",
          "SOWs: include at minimum cover_page, overview, scope, deliverables, pricing, signatures",
        ],
        tool_optimization: [
          "ALWAYS use the _generate one-shot tools (pptx_generate, sow_generate, etc.) — they produce the full document in 1 tool call",
          "For PPTX: pptx_generate takes an array of slides with layouts+data — entire deck in 1 call",
          "For custom/dashboard slides: use pptx_add_elements (BATCH) to add all shapes/text/charts in 1 call instead of calling pptx_add_element per element",
          "Only fall back to create/add_section/export flow if you need interactive editing between sections",
          "Plan ALL content upfront, then execute with minimum tool calls",
          "Read knowledge://pptx-best-practices for the full layout selection guide",
        ],
      }, null, 2),
    }],
  })
);

// Knowledge resource: PPTX best practices
server.resource(
  "pptx-best-practices",
  "knowledge://pptx-best-practices",
  "PPTX generation best practices — layout selection guide, tool optimization, content-to-layout mapping. ALWAYS read this before creating presentations.",
  async (uri) => {
    const bp = fs.readFileSync(path.join(KNOWLEDGE_DIR, "pptx-best-practices.md"), "utf-8");
    return {
      contents: [{
        uri: uri.href,
        mimeType: "text/markdown",
        text: bp,
      }],
    };
  }
);

// Knowledge resource: Tavant company context
server.resource(
  "tavant-company-knowledge",
  "knowledge://tavant-company",
  "Tavant company knowledge base — services, practices, capabilities, case studies, technology stack. Use this to get context when creating presentations, contracts, or SOWs about Tavant.",
  async (uri) => {
    const knowledge = loadKnowledge();
    const allContent = Object.values(knowledge).join("\n\n---\n\n");
    return {
      contents: [{
        uri: uri.href,
        mimeType: "text/markdown",
        text: allContent,
      }],
    };
  }
);

// Tool: get Tavant company context
server.tool(
  "get_tavant_context",
  "Get Tavant company knowledge — services, AI practice, data practice, AIOps, automation capabilities, analytics framework, technology stack, and client case studies. ALWAYS call this before creating presentations about Tavant to get accurate content.",
  {
    topic: z.string().optional().describe(
      "Optional: filter by topic — 'services', 'ai_practice', 'automation', 'data', 'aiops', 'analytics', 'technology', or leave empty for all"
    ),
  },
  async ({ topic }) => {
    const knowledge = loadKnowledge();
    const fullText = knowledge["tavant-company"] || "";

    if (!topic) {
      return { content: [{ type: "text", text: fullText }] };
    }

    // Topic-based filtering by section headers
    const topicMap = {
      services: "Service Portfolio",
      ai_practice: "AI & Agentic AI Practice",
      automation: "AI & Automation",
      data: "Data Transformation Practice",
      aiops: "AIOps for Data Platforms",
      analytics: "Analytics Framework",
      technology: "Technology Stack",
    };

    const sectionHeader = topicMap[topic.toLowerCase()];
    if (!sectionHeader) {
      return { content: [{ type: "text", text: fullText }] };
    }

    // Extract the relevant section
    const lines = fullText.split("\n");
    let capturing = false;
    let result = [];
    let headerLevel = 0;

    for (const line of lines) {
      if (line.startsWith("## ") && line.includes(sectionHeader)) {
        capturing = true;
        headerLevel = 2;
        result.push(line);
        continue;
      }
      if (capturing) {
        if (line.startsWith("## ") && !line.includes(sectionHeader) && line !== "---") {
          break; // Next top-level section
        }
        if (line === "---") {
          break;
        }
        result.push(line);
      }
    }

    return {
      content: [{
        type: "text",
        text: result.length > 0 ? result.join("\n") : fullText,
      }],
    };
  }
);

// Register all template tools
pptx.register(server);
contract.register(server);
sow.register(server);
nda.register(server);
cr.register(server);
msa.register(server);

// ─── Start ─────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Tavant Docs MCP server running (pptx + contract + sow + nda + cr + msa)");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
