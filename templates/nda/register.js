const { Document, Packer, Header, Footer, Paragraph, TextRun, AlignmentType } = require("docx");
const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const SECTIONS = require("./sections");
const sectionBuilders = require("./builders");
const BRAND = require("../../brand");

const ndas = new Map();

function register(server) {
  server.tool(
    "nda_list_sections",
    "List all available sections for Tavant Mutual NDA with their descriptions and fields",
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
    "nda_create",
    "Create a new Tavant Mutual NDA document. Returns an nda_id. Use nda_add_section to build it, then nda_export to save as .docx",
    {
      company_name: z.string().optional().describe("The other party's company name"),
      effective_date: z.string().optional().describe("NDA effective date"),
    },
    async ({ company_name, effective_date }) => {
      const id = uuidv4();
      ndas.set(id, {
        company_name: company_name || "[Company Name]",
        effective_date: effective_date || "[Date]",
        sections: [],
      });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            nda_id: id,
            company_name: ndas.get(id).company_name,
            message: "NDA created. Use nda_add_section to add sections, then nda_export to save.",
          }),
        }],
      };
    }
  );

  server.tool(
    "nda_add_section",
    "Add a section to an NDA document",
    {
      nda_id: z.string().describe("The NDA ID from nda_create"),
      section: z.string().describe(
        "Section ID: cover_page, preamble, proprietary_information, protection, exclusions, rights, legends, general_terms, term, entire_agreement, signatures"
      ),
      data: z.record(z.any()).optional().describe(
        "Section content data. Use nda_list_sections to see fields per section. Many sections have no required fields (standard legal text)."
      ),
    },
    async ({ nda_id, section, data }) => {
      const nda = ndas.get(nda_id);
      if (!nda) return { content: [{ type: "text", text: "Error: NDA not found." }], isError: true };
      const builder = sectionBuilders[section];
      if (!builder) {
        return {
          content: [{ type: "text", text: `Error: Unknown section "${section}". Available: ${Object.keys(SECTIONS).join(", ")}` }],
          isError: true,
        };
      }
      nda.sections.push({ section, data: data || {} });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ message: `Section added: ${section}`, total_sections: nda.sections.length }),
        }],
      };
    }
  );

  server.tool(
    "nda_export",
    "Export NDA as a .docx Word document",
    {
      nda_id: z.string().describe("The NDA ID"),
      output_path: z.string().optional().describe("Output file path. Defaults to ./output/NDA_<company>.docx"),
    },
    async ({ nda_id, output_path }) => {
      const nda = ndas.get(nda_id);
      if (!nda) return { content: [{ type: "text", text: "Error: NDA not found." }], isError: true };

      const children = [];
      for (const { section, data } of nda.sections) {
        const builder = sectionBuilders[section];
        if (builder) {
          const paragraphs = builder({
            ...data,
            company_name: data.company_name || nda.company_name,
            effective_date: data.effective_date || nda.effective_date,
          });
          children.push(...paragraphs);
        }
      }

      const doc = new Document({
        creator: "Tavant",
        title: `Mutual NDA - ${nda.company_name}`,
        description: `Mutual Non-Disclosure Agreement between Tavant and ${nda.company_name}`,
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
                      text: `Mutual NDA | ${nda.company_name} | ${BRAND.company}`,
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
      const sanitized = (nda.company_name || "NDA").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
      const defaultDir = BRAND.getOutputDir();
      const filePath = output_path ? path.resolve(output_path) : path.join(defaultDir, `NDA_${sanitized}.docx`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, buffer);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ message: "NDA exported", file_path: filePath, total_sections: nda.sections.length }),
        }],
      };
    }
  );

  server.tool(
    "nda_delete",
    "Delete an NDA from memory",
    { nda_id: z.string().describe("The NDA ID") },
    async ({ nda_id }) => {
      if (ndas.delete(nda_id)) return { content: [{ type: "text", text: "NDA deleted." }] };
      return { content: [{ type: "text", text: "Not found." }], isError: true };
    }
  );
}

module.exports = { register };
