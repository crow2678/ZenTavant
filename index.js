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
          pptx: "PowerPoint presentations — use pptx_* tools",
          contract: "Contract agreements (Word .docx) — use contract_* tools",
          sow: "Statements of Work (Word .docx) — use sow_* tools",
          nda: "Mutual Non-Disclosure Agreements (Word .docx) — use nda_* tools",
          cr: "Change Requests (Word .docx) — use cr_* tools",
          msa: "Master Services Agreement / Professional Services Agreement (Word .docx) — use msa_* tools",
        },
        guidelines: [
          "Every document uses Tavant branding: orange #F36E26, Aptos font",
          "Presentations: start with title_cover, end with thank_you",
          "Contracts: include at minimum parties, scope_of_work, commercial_terms, signatures",
          "SOWs: include at minimum cover_page, overview, scope, deliverables, pricing, signatures",
        ],
        pptx_optimization: [
          "ALWAYS prefer pptx_add_slide (1 tool call) over pptx_add_custom_slide + elements when a template layout fits",
          "Plan ALL slides upfront before making any tool calls — decide layouts first, then execute in one pass",
          "Use content/title_subtitle_content for bullet lists, image_content_a for content+image, image_grid for 6-item grids, three_column_images for 3 features",
          "Only use pptx_add_custom_slide for step-by-step instructions or layouts no template covers",
          "Keep agenda items under 40 characters — pass as clean string array",
          "Pass body as string array ['item 1', 'item 2'] not one long string",
          "For custom slides: use rich text arrays and tables to minimize pptx_add_element calls",
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
