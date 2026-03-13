const { Document, Packer, Header, Footer, Paragraph, TextRun, AlignmentType } = require("docx");
const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const SECTIONS = require("./sections");
const sectionBuilders = require("./builders");
const BRAND = require("../../brand");

const changeRequests = new Map();

function register(server) {
  server.tool(
    "cr_list_sections",
    "List all available sections for Tavant Change Request (CR) documents with their descriptions and fields",
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
    "cr_create",
    "Create a new Tavant Change Request document. Returns a cr_id. Use cr_add_section to build it, then cr_export to save as .docx",
    {
      customer_name: z.string().optional().describe("Customer/client company name"),
      project_name: z.string().optional().describe("Project or SOW name"),
      co_number: z.string().optional().describe("Change Order number, e.g. '001'"),
    },
    async ({ customer_name, project_name, co_number }) => {
      const id = uuidv4();
      changeRequests.set(id, {
        customer_name: customer_name || "[Customer Name]",
        project_name: project_name || "[Project Name]",
        co_number: co_number || "001",
        sections: [],
      });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            cr_id: id,
            customer_name: changeRequests.get(id).customer_name,
            project_name: changeRequests.get(id).project_name,
            message: "Change Request created. Use cr_add_section to add sections, then cr_export to save.",
          }),
        }],
      };
    }
  );

  server.tool(
    "cr_add_section",
    "Add a section to a Change Request document",
    {
      cr_id: z.string().describe("The CR ID from cr_create"),
      section: z.string().describe(
        "Section ID: cover_page, background, project_details, charges, invoicing, sow_reference, counterparts, signatures"
      ),
      data: z.record(z.any()).optional().describe(
        "Section content data. Use cr_list_sections to see fields per section."
      ),
    },
    async ({ cr_id, section, data }) => {
      const cr = changeRequests.get(cr_id);
      if (!cr) return { content: [{ type: "text", text: "Error: Change Request not found." }], isError: true };
      const builder = sectionBuilders[section];
      if (!builder) {
        return {
          content: [{ type: "text", text: `Error: Unknown section "${section}". Available: ${Object.keys(SECTIONS).join(", ")}` }],
          isError: true,
        };
      }
      cr.sections.push({ section, data: data || {} });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ message: `Section added: ${section}`, total_sections: cr.sections.length }),
        }],
      };
    }
  );

  server.tool(
    "cr_export",
    "Export Change Request as a .docx Word document",
    {
      cr_id: z.string().describe("The CR ID"),
      output_path: z.string().optional().describe("Output file path. Defaults to ./output/CR_<project>.docx"),
    },
    async ({ cr_id, output_path }) => {
      const cr = changeRequests.get(cr_id);
      if (!cr) return { content: [{ type: "text", text: "Error: Change Request not found." }], isError: true };

      const children = [];
      for (const { section, data } of cr.sections) {
        const builder = sectionBuilders[section];
        if (builder) {
          const paragraphs = builder({
            ...data,
            customer_name: data.customer_name || cr.customer_name,
            project_name: data.project_name || cr.project_name,
            co_number: data.co_number || cr.co_number,
          });
          children.push(...paragraphs);
        }
      }

      const doc = new Document({
        creator: "Tavant",
        title: `Change Request CO# ${cr.co_number} - ${cr.project_name}`,
        description: `Change Request for ${cr.project_name}`,
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
                  children: [
                    new TextRun({ text: BRAND.footer, font: BRAND.font, size: 16, color: "999999", italics: true }),
                  ],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `CR CO# ${cr.co_number} | ${cr.project_name} | ${BRAND.company} & ${cr.customer_name} Confidential`,
                      font: BRAND.font, size: 16, color: "999999",
                    }),
                  ],
                }),
              ],
            }),
          },
          children,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const sanitized = (cr.project_name || "CR").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
      const defaultDir = path.join(process.cwd(), "output");
      if (!fs.existsSync(defaultDir)) fs.mkdirSync(defaultDir, { recursive: true });
      const filePath = output_path || path.join(defaultDir, `CR_${sanitized}.docx`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, buffer);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ message: "Change Request exported", file_path: filePath, total_sections: cr.sections.length }),
        }],
      };
    }
  );

  server.tool(
    "cr_delete",
    "Delete a Change Request from memory",
    { cr_id: z.string().describe("The CR ID") },
    async ({ cr_id }) => {
      if (changeRequests.delete(cr_id)) return { content: [{ type: "text", text: "Change Request deleted." }] };
      return { content: [{ type: "text", text: "Not found." }], isError: true };
    }
  );
}

module.exports = { register };
