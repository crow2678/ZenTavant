const { Document, Packer, Header, Footer, Paragraph, TextRun, AlignmentType } = require("docx");
const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const SECTIONS = require("./sections");
const sectionBuilders = require("./builders");
const BRAND = require("../../brand");

const msas = new Map();

function register(server) {
  server.tool(
    "msa_list_sections",
    "List all available sections for Tavant MSA (Professional Services Agreement) with their descriptions and fields",
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
    "msa_create",
    "Create a new Tavant MSA (Professional Services Agreement). Returns an msa_id. Use msa_add_section to build it, then msa_export to save as .docx",
    {
      customer_name: z.string().optional().describe("Customer/client company name"),
      effective_date: z.string().optional().describe("Agreement effective date"),
    },
    async ({ customer_name, effective_date }) => {
      const id = uuidv4();
      msas.set(id, {
        customer_name: customer_name || "[Customer Name]",
        effective_date: effective_date || "[Date]",
        sections: [],
      });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            msa_id: id,
            customer_name: msas.get(id).customer_name,
            message: "MSA created. Use msa_add_section to add sections, then msa_export to save.",
          }),
        }],
      };
    }
  );

  server.tool(
    "msa_add_section",
    "Add a section to an MSA document. Most sections use standard Tavant legal language with no required fields.",
    {
      msa_id: z.string().describe("The MSA ID from msa_create"),
      section: z.string().describe(
        "Section ID: cover_page, preamble, definitions, professional_services, acceptance_and_fees, ownership, confidentiality, warranties, indemnification, limitation_of_liability, term_and_termination, general_provisions, signatures"
      ),
      data: z.record(z.any()).optional().describe(
        "Section content data. Most sections have no required fields (standard legal text). Only cover_page, preamble, and signatures accept custom data. Use msa_list_sections to see fields."
      ),
    },
    async ({ msa_id, section, data }) => {
      const msa = msas.get(msa_id);
      if (!msa) return { content: [{ type: "text", text: "Error: MSA not found." }], isError: true };
      const builder = sectionBuilders[section];
      if (!builder) {
        return {
          content: [{ type: "text", text: `Error: Unknown section "${section}". Available: ${Object.keys(SECTIONS).join(", ")}` }],
          isError: true,
        };
      }
      msa.sections.push({ section, data: data || {} });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ message: `Section added: ${section}`, total_sections: msa.sections.length }),
        }],
      };
    }
  );

  server.tool(
    "msa_export",
    "Export MSA (Professional Services Agreement) as a .docx Word document",
    {
      msa_id: z.string().describe("The MSA ID"),
      output_path: z.string().optional().describe("Output file path. Defaults to ./output/MSA_<customer>.docx"),
    },
    async ({ msa_id, output_path }) => {
      const msa = msas.get(msa_id);
      if (!msa) return { content: [{ type: "text", text: "Error: MSA not found." }], isError: true };

      const children = [];
      for (const { section, data } of msa.sections) {
        const builder = sectionBuilders[section];
        if (builder) {
          const paragraphs = builder({
            ...data,
            customer_name: data.customer_name || msa.customer_name,
            effective_date: data.effective_date || msa.effective_date,
          });
          children.push(...paragraphs);
        }
      }

      const doc = new Document({
        creator: "Tavant",
        title: `Professional Services Agreement - ${msa.customer_name}`,
        description: `MSA between Tavant Technologies, Inc. and ${msa.customer_name}`,
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
                    new TextRun({ text: "Tavant Technologies, Inc. Confidential", font: BRAND.font, size: 16, color: "999999", italics: true }),
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
                      text: `Professional Services Agreement | ${msa.customer_name} | Tavant Technologies, Inc.`,
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
      const sanitized = (msa.customer_name || "MSA").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
      const defaultDir = path.join(process.cwd(), "output");
      if (!fs.existsSync(defaultDir)) fs.mkdirSync(defaultDir, { recursive: true });
      const filePath = output_path || path.join(defaultDir, `MSA_${sanitized}.docx`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, buffer);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ message: "MSA exported", file_path: filePath, total_sections: msa.sections.length }),
        }],
      };
    }
  );

  server.tool(
    "msa_delete",
    "Delete an MSA from memory",
    { msa_id: z.string().describe("The MSA ID") },
    async ({ msa_id }) => {
      if (msas.delete(msa_id)) return { content: [{ type: "text", text: "MSA deleted." }] };
      return { content: [{ type: "text", text: "Not found." }], isError: true };
    }
  );
}

module.exports = { register };
