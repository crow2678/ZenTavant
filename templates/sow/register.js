const { Document, Packer, Header, Footer, Paragraph, TextRun, AlignmentType } = require("docx");
const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const SECTIONS = require("./sections");
const sectionBuilders = require("./builders");
const BRAND = require("../../brand");

const sows = new Map();

function register(server) {
  server.tool(
    "sow_list_sections",
    "List all available sections for Tavant Statement of Work documents",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify(Object.values(SECTIONS).map((s) => ({
          id: s.id, name: s.name, description: s.description, fields: s.fields,
        })), null, 2),
      }],
    })
  );

  server.tool(
    "sow_create",
    "Create a new Tavant Statement of Work document. Returns a sow_id.",
    {
      project_name: z.string().optional().describe("Project name"),
      client_name: z.string().optional().describe("Client company name"),
      effective_date: z.string().optional().describe("SOW date"),
    },
    async ({ project_name, client_name, effective_date }) => {
      const id = uuidv4();
      sows.set(id, {
        project_name: project_name || "[Project]",
        client_name: client_name || "[Client]",
        effective_date: effective_date || "[Date]",
        sections: [],
      });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            sow_id: id,
            project_name: sows.get(id).project_name,
            message: "SOW created. Use sow_add_section to build it, then sow_export to save.",
          }),
        }],
      };
    }
  );

  server.tool(
    "sow_add_section",
    "Add a section to a Statement of Work document",
    {
      sow_id: z.string().describe("The SOW ID from sow_create"),
      section: z.string().describe(
        "Section ID: cover_page, overview, scope, approach, deliverables, timeline, team, pricing, assumptions, governance, acceptance, signatures"
      ),
      data: z.record(z.any()).describe("Section content data. Use sow_list_sections to see fields."),
    },
    async ({ sow_id, section, data }) => {
      const sow = sows.get(sow_id);
      if (!sow) {
        return { content: [{ type: "text", text: "Error: SOW not found." }], isError: true };
      }
      const builder = sectionBuilders[section];
      if (!builder) {
        return {
          content: [{ type: "text", text: `Error: Unknown section "${section}". Available: ${Object.keys(SECTIONS).join(", ")}` }],
          isError: true,
        };
      }
      sow.sections.push({ section, data: data || {} });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ message: `Section added: ${section}`, total_sections: sow.sections.length }),
        }],
      };
    }
  );

  server.tool(
    "sow_export",
    "Export Statement of Work as a .docx Word document",
    {
      sow_id: z.string().describe("The SOW ID"),
      output_path: z.string().optional().describe("Output path. Defaults to ./output/<project>.docx"),
    },
    async ({ sow_id, output_path }) => {
      const sow = sows.get(sow_id);
      if (!sow) {
        return { content: [{ type: "text", text: "Error: SOW not found." }], isError: true };
      }

      const children = [];
      for (const { section, data } of sow.sections) {
        const builder = sectionBuilders[section];
        if (builder) {
          children.push(...builder({
            ...data,
            client_name: data.client_name || sow.client_name,
            effective_date: data.effective_date || sow.effective_date,
            project_name: data.project_name || sow.project_name,
          }));
        }
      }

      const doc = new Document({
        creator: "Tavant",
        title: `SOW — ${sow.project_name}`,
        styles: {
          default: {
            document: {
              run: { font: BRAND.font, size: 22, color: "333333" },
            },
          },
        },
        sections: [{
          properties: {
            page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: BRAND.footer, font: BRAND.font, size: 16, color: "999999", italics: true })],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `SOW: ${sow.project_name} | ${sow.client_name} | ${BRAND.company}`, font: BRAND.font, size: 16, color: "999999" })],
                }),
              ],
            }),
          },
          children,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const sanitized = (sow.project_name || "sow").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
      const defaultDir = BRAND.getOutputDir();
      const filePath = output_path ? path.resolve(output_path) : path.join(defaultDir, `SOW_${sanitized}.docx`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, buffer);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ message: "SOW exported", file_path: filePath, total_sections: sow.sections.length }),
        }],
      };
    }
  );

  server.tool(
    "sow_delete",
    "Delete a SOW from memory",
    { sow_id: z.string().describe("The SOW ID") },
    async ({ sow_id }) => {
      if (sows.delete(sow_id)) {
        return { content: [{ type: "text", text: "SOW deleted." }] };
      }
      return { content: [{ type: "text", text: "Not found." }], isError: true };
    }
  );
}

module.exports = { register };
