const { Document, Packer, Header, Footer, Paragraph, TextRun, AlignmentType } = require("docx");
const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const SECTIONS = require("./sections");
const sectionBuilders = require("./builders");
const BRAND = require("../../brand");

const contracts = new Map();

function register(server) {
  server.tool(
    "contract_list_sections",
    "List all available sections for Tavant contract documents with their fields",
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
    "contract_create",
    "Create a new Tavant contract document. Returns a contract_id. Use contract_add_section to build it, then contract_export to save as .docx",
    {
      contract_title: z.string().optional().describe("Contract title, e.g. 'Master Services Agreement'"),
      client_name: z.string().optional().describe("Client company name"),
      effective_date: z.string().optional().describe("Contract effective date"),
    },
    async ({ contract_title, client_name, effective_date }) => {
      const id = uuidv4();
      contracts.set(id, {
        title: contract_title || "Services Agreement",
        client_name: client_name || "[Client]",
        effective_date: effective_date || "[Date]",
        sections: [],
      });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            contract_id: id,
            title: contracts.get(id).title,
            message: "Contract created. Use contract_add_section to add sections, then contract_export to save.",
          }),
        }],
      };
    }
  );

  server.tool(
    "contract_add_section",
    "Add a section to a contract document",
    {
      contract_id: z.string().describe("The contract ID from contract_create"),
      section: z.string().describe(
        "Section ID: cover_page, parties, scope_of_work, timeline, commercial_terms, confidentiality, ip_rights, termination, liability, general_provisions, signatures"
      ),
      data: z.record(z.any()).describe(
        "Section content data. Use contract_list_sections to see fields per section."
      ),
    },
    async ({ contract_id, section, data }) => {
      const contract = contracts.get(contract_id);
      if (!contract) {
        return { content: [{ type: "text", text: "Error: Contract not found." }], isError: true };
      }
      const builder = sectionBuilders[section];
      if (!builder) {
        return {
          content: [{ type: "text", text: `Error: Unknown section "${section}". Available: ${Object.keys(SECTIONS).join(", ")}` }],
          isError: true,
        };
      }
      contract.sections.push({ section, data: data || {} });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            message: `Section added: ${section}`,
            total_sections: contract.sections.length,
          }),
        }],
      };
    }
  );

  server.tool(
    "contract_export",
    "Export contract as a .docx Word document",
    {
      contract_id: z.string().describe("The contract ID"),
      output_path: z.string().optional().describe("Output file path. Defaults to ./output/<title>.docx"),
    },
    async ({ contract_id, output_path }) => {
      const contract = contracts.get(contract_id);
      if (!contract) {
        return { content: [{ type: "text", text: "Error: Contract not found." }], isError: true };
      }

      // Build all section paragraphs
      const children = [];
      for (const { section, data } of contract.sections) {
        const builder = sectionBuilders[section];
        if (builder) {
          const paragraphs = builder({
            ...data,
            client_name: data.client_name || contract.client_name,
            effective_date: data.effective_date || contract.effective_date,
            contract_title: data.contract_title || contract.title,
          });
          children.push(...paragraphs);
        }
      }

      const doc = new Document({
        creator: "Tavant",
        title: contract.title,
        description: `Contract: ${contract.title}`,
        styles: {
          default: {
            document: {
              run: { font: BRAND.font, size: 22, color: "333333" },
            },
          },
        },
        sections: [{
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: BRAND.footer,
                      font: BRAND.font,
                      size: 16,
                      color: "999999",
                      italics: true,
                    }),
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
                      text: `${contract.title} | ${contract.client_name} | ${BRAND.company}`,
                      font: BRAND.font,
                      size: 16,
                      color: "999999",
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

      const sanitized = (contract.title || "contract").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
      const defaultDir = BRAND.getOutputDir();
      const filePath = output_path ? path.resolve(output_path) : path.join(defaultDir, `${sanitized}.docx`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, buffer);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            message: "Contract exported",
            file_path: filePath,
            total_sections: contract.sections.length,
          }),
        }],
      };
    }
  );

  server.tool(
    "contract_delete",
    "Delete a contract from memory",
    { contract_id: z.string().describe("The contract ID") },
    async ({ contract_id }) => {
      if (contracts.delete(contract_id)) {
        return { content: [{ type: "text", text: "Contract deleted." }] };
      }
      return { content: [{ type: "text", text: "Not found." }], isError: true };
    }
  );

  // ─── Tool: ONE-SHOT generate full contract ──────────────────────────────
  server.tool(
    "contract_generate",
    "Generate a complete Tavant contract in ONE call. Pass all sections at once — no need for contract_create/contract_add_section/contract_export. This is the PREFERRED tool.",
    {
      contract_title: z.string().optional().describe("Contract title"),
      client_name: z.string().optional().describe("Client company name"),
      effective_date: z.string().optional().describe("Contract effective date"),
      sections: z.array(z.object({
        section: z.string().describe("Section ID: cover_page, parties, scope_of_work, timeline, commercial_terms, confidentiality, ip_rights, termination, liability, general_provisions, signatures"),
        data: z.record(z.any()).optional().describe("Section content data"),
      })).describe("Array of sections with their data"),
      output_path: z.string().optional().describe("Output path. Defaults to ~/Documents/TavantDocs/<title>.docx"),
    },
    async ({ contract_title, client_name, effective_date, sections: sectionList, output_path }) => {
      const contractData = {
        title: contract_title || "Services Agreement",
        client_name: client_name || "[Client]",
        effective_date: effective_date || "[Date]",
      };

      const children = [];
      const errors = [];
      for (const { section, data } of (sectionList || [])) {
        const builder = sectionBuilders[section];
        if (!builder) { errors.push(`Unknown section "${section}"`); continue; }
        try {
          children.push(...builder({
            ...(data || {}),
            client_name: (data && data.client_name) || contractData.client_name,
            effective_date: (data && data.effective_date) || contractData.effective_date,
            contract_title: (data && data.contract_title) || contractData.title,
          }));
        } catch (err) { errors.push(`Error in ${section}: ${err.message}`); }
      }

      const doc = new Document({
        creator: "Tavant", title: contractData.title,
        description: `Contract: ${contractData.title}`,
        styles: { default: { document: { run: { font: BRAND.font, size: 22, color: "333333" } } } },
        sections: [{
          properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
          headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: BRAND.footer, font: BRAND.font, size: 16, color: "999999", italics: true })] })] }) },
          footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${contractData.title} | ${contractData.client_name} | ${BRAND.company}`, font: BRAND.font, size: 16, color: "999999" })] })] }) },
          children,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const sanitized = (contractData.title || "contract").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
      const defaultDir = BRAND.getOutputDir();
      const filePath = output_path ? path.resolve(output_path) : path.join(defaultDir, `${sanitized}.docx`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, buffer);

      const result = { message: "Contract generated", file_path: filePath, total_sections: sectionList.length };
      if (errors.length) result.warnings = errors;
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}

module.exports = { register };
