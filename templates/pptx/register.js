const PptxGenJS = require("pptxgenjs");
const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const LAYOUTS = require("./layouts");
const slideBuilders = require("./builders");
const BRAND = require("../../brand");

const ASSETS = path.join(__dirname, "..", "..", "assets");
const imgPath = (name) => path.join(ASSETS, name);

const presentations = new Map();

// ─── Helpers for creative slide building ────────────────────────────────
function addChromeToSlide(slide, isDark) {
  // Footer bar (black bar with orange triangle)
  if (fs.existsSync(imgPath("footer-bar.png"))) {
    slide.addImage({ path: imgPath("footer-bar.png"), x: 0, y: 6.83, w: 13.33, h: 0.67 });
  }
  // Tavant logo — LEFT bottom on footer bar
  if (fs.existsSync(imgPath("tavant-logo-small.png"))) {
    slide.addImage({ path: imgPath("tavant-logo-small.png"), x: 0.29, y: 7.07, w: 1.38, h: 0.38 });
  }
  // Confidential text — right bottom, black, single line
  slide.addText("Tavant & Customer Confidential", {
    x: 9.5, y: 7.15, w: 3.0, h: 0.18,
    fontSize: 10.7, color: "000000", fontFace: BRAND.font, wrap: false,
  });
}

// ─── Shared element renderer (used by single + batch tools) ──────────────
function addElementToSlide(slide, pptx, element_type, props) {
  switch (element_type) {
    case "text": {
      const textContent = props.text || "";
      const textOpts = {
        x: props.x || 0, y: props.y || 0,
        w: props.w || 4, h: props.h || 1,
        fontSize: props.fontSize || 14,
        color: props.color || "333333",
        fontFace: props.fontFace || BRAND.font,
        bold: props.bold || false,
        italic: props.italic || false,
        align: props.align || undefined,
        valign: props.valign || undefined,
        paraSpaceAfter: props.paraSpaceAfter || undefined,
        lineSpacing: props.lineSpacing || undefined,
      };
      if (props.fill) textOpts.fill = { color: props.fill };
      if (props.rectRadius) textOpts.rectRadius = props.rectRadius;
      if (props.bullet) textOpts.bullet = props.bullet;
      if (props.shape) textOpts.shape = props.shape;
      slide.addText(textContent, textOpts);
      break;
    }
    case "shape": {
      const shapeType = pptx.ShapeType[props.shape || "rect"];
      const shapeOpts = {
        x: props.x || 0, y: props.y || 0,
        w: props.w || 2, h: props.h || 2,
      };
      if (props.fill) shapeOpts.fill = { color: props.fill };
      if (props.line) shapeOpts.line = props.line;
      if (props.rectRadius) shapeOpts.rectRadius = props.rectRadius;
      if (props.rotate) shapeOpts.rotate = props.rotate;
      slide.addShape(shapeType, shapeOpts);
      break;
    }
    case "chart": {
      const chartTypeMap = {
        bar: pptx.ChartType.bar, line: pptx.ChartType.line,
        pie: pptx.ChartType.pie, doughnut: pptx.ChartType.doughnut,
        area: pptx.ChartType.area,
      };
      const chartType = chartTypeMap[props.chartType || "bar"];
      const chartOpts = {
        x: props.x || 0.5, y: props.y || 1.5,
        w: props.w || 6, h: props.h || 4,
        showValue: props.showValue !== undefined ? props.showValue : true,
        showLegend: props.showLegend || false,
        legendPos: props.legendPos || "b",
      };
      if (props.chartColors) chartOpts.chartColors = props.chartColors;
      slide.addChart(chartType, props.data || [], chartOpts);
      break;
    }
    case "table": {
      const tableOpts = {
        x: props.x || 0.5, y: props.y || 1.5,
        w: props.w || undefined, h: props.h || undefined,
        fontSize: props.fontSize || 12,
        color: props.color || "333333",
        fontFace: BRAND.font,
        autoPage: props.autoPage || false,
      };
      if (props.colW) tableOpts.colW = props.colW;
      if (props.rowH) tableOpts.rowH = props.rowH;
      if (props.border) tableOpts.border = props.border;
      const rows = (props.rows || []).map((row, rowIdx) =>
        row.map(cell => {
          const isHeader = rowIdx === 0 && props.headerFill;
          return {
            text: String(cell),
            options: {
              fill: isHeader ? { color: props.headerFill } : undefined,
              color: isHeader ? (props.headerColor || "FFFFFF") : props.color || "333333",
              bold: isHeader ? true : false,
              fontSize: props.fontSize || 12,
              fontFace: BRAND.font,
              valign: "middle",
              margin: [4, 6, 4, 6],
            },
          };
        })
      );
      slide.addTable(rows, tableOpts);
      break;
    }
  }
}

function register(server) {

  // ─── Tool: list layouts ────────────────────────────────────────────────
  server.tool(
    "pptx_list_layouts",
    "List all available Tavant corporate slide layouts with their descriptions and required fields",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify(Object.values(LAYOUTS).map((l) => ({
          id: l.id, name: l.name, description: l.description, fields: l.fields,
        })), null, 2),
      }],
    })
  );

  // ─── Tool: create presentation ─────────────────────────────────────────
  server.tool(
    "pptx_create",
    "Create a new empty Tavant-branded PowerPoint presentation. Returns a presentation_id.",
    {
      title: z.string().optional().describe("Presentation title"),
      author: z.string().optional().describe("Author name"),
    },
    async ({ title, author }) => {
      const id = uuidv4();
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.50
      pptx.title = title || "Tavant Presentation";
      pptx.author = author || "Tavant";
      pptx.company = "Tavant";
      presentations.set(id, { pptx, slideCount: 0, title: pptx.title });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            presentation_id: id,
            title: pptx.title,
            slide_size: "13.33 x 7.50 inches (widescreen)",
            body_area: "x:0.36 y:1.20 to x:12.97 y:6.70 (usable body after title, before footer)",
            message: "Presentation created. Use pptx_add_slide for template layouts, or pptx_add_custom_slide + pptx_add_element for creative freedom. Use pptx_export to save.",
          }),
        }],
      };
    }
  );

  // ─── Tool: add slide (template layout) ─────────────────────────────────
  server.tool(
    "pptx_add_slide",
    "Add a slide using a pre-built Tavant corporate template layout. Good for standard slides. For creative/custom layouts, use pptx_add_custom_slide + pptx_add_element instead.",
    {
      presentation_id: z.string().describe("The presentation ID"),
      layout: z.string().describe(
        "Layout ID: title_cover, agenda, breaker_ai, breaker_cloud, breaker_abstract, blank, title_only, title_only_dark, content_dark, content, title_subtitle, two_column, title_subtitle_content, multi_case_study, image_content_a, image_content_b, image_grid, three_column_images, chart, timeline_vertical, timeline_horizontal, multi_quote, thank_you"
      ),
      data: z.record(z.any()).describe(
        "Slide content — fields depend on layout. Use pptx_list_layouts to see fields. body can be string or string[]. columns/grid_items: [{title,description}]. milestones: [{date,label}]. chart_data: {labels:[],values:[]}. quotes: [{company,title,text}]."
      ),
    },
    async ({ presentation_id, layout, data }) => {
      const pres = presentations.get(presentation_id);
      if (!pres) return { content: [{ type: "text", text: "Error: Presentation not found." }], isError: true };
      const builder = slideBuilders[layout];
      if (!builder) {
        return { content: [{ type: "text", text: `Error: Unknown layout "${layout}". Available: ${Object.keys(LAYOUTS).join(", ")}` }], isError: true };
      }
      builder(pres.pptx, data || {});
      pres.slideCount++;
      return {
        content: [{ type: "text", text: JSON.stringify({ message: `Slide added (${layout})`, slide_number: pres.slideCount, total_slides: pres.slideCount }) }],
      };
    }
  );

  // ─── Tool: add CUSTOM slide (chrome only — body is yours) ──────────────
  server.tool(
    "pptx_add_custom_slide",
    "Add a blank Tavant-branded slide with ONLY the corporate chrome (footer bar, Tavant logo at left-bottom, confidential text). The body area is completely free for you to design creatively using pptx_add_element. Use this when you want to go beyond the standard template layouts — create unique visuals, custom grids, icon layouts, etc. Returns a slide_index to use with pptx_add_element.",
    {
      presentation_id: z.string().describe("The presentation ID"),
      background: z.string().optional().describe("Background color hex without #. Default: FFFFFF. Use 000000 for dark, 222222 for dark grey, F26F26 for orange, 77787B for grey."),
      title: z.string().optional().describe("Optional slide title at standard position (0.36, 0.37)"),
      subtitle: z.string().optional().describe("Optional orange subtitle at standard position (0.36, 0.78)"),
      background_image: z.string().optional().describe("Background image name from assets: bg-title-tech.jpeg, bg-agenda-data.jpeg, bg-breaker-brain.jpeg, bg-breaker-cloud.jpeg, bg-breaker-lines.jpeg, bg-thankyou.jpeg"),
    },
    async ({ presentation_id, background, title, subtitle, background_image }) => {
      const pres = presentations.get(presentation_id);
      if (!pres) return { content: [{ type: "text", text: "Error: Presentation not found." }], isError: true };

      const bgColor = background || "FFFFFF";
      const isDark = ["000000", "222222", "1A1A1A"].includes(bgColor);
      const slide = pres.pptx.addSlide();
      slide.background = { color: bgColor };

      // Background image if requested
      if (background_image && fs.existsSync(imgPath(background_image))) {
        slide.addImage({ path: imgPath(background_image), x: 0, y: 0, w: 13.33, h: 7.50 });
      }

      // Title
      if (title) {
        slide.addText(title, {
          x: 0.36, y: 0.37, w: 12.62, h: 0.39,
          fontSize: 24, bold: true, color: isDark ? "FFFFFF" : "000000", fontFace: BRAND.font,
        });
      }

      // Subtitle
      if (subtitle) {
        slide.addText(subtitle, {
          x: 0.36, y: 0.78, w: 12.62, h: 0.41,
          fontSize: 18, color: "F77A33", fontFace: BRAND.font,
        });
      }

      // Corporate chrome (footer, logo, confidential)
      addChromeToSlide(slide, isDark);

      pres.slideCount++;
      // Store the slide reference for adding elements
      if (!pres.slides) pres.slides = {};
      pres.slides[pres.slideCount] = slide;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            message: "Custom slide created with Tavant chrome",
            slide_index: pres.slideCount,
            total_slides: pres.slideCount,
            body_area: {
              note: "Add elements freely in this area. Footer starts at y=6.83.",
              x_min: 0.3, y_min: title ? (subtitle ? 1.30 : 0.90) : 0.20,
              x_max: 13.0, y_max: 6.70,
              width: 12.7, height: title ? (subtitle ? 5.40 : 5.80) : 6.50,
            },
            brand_colors: {
              orange: "F36E26", accent_orange: "F77A33", bullet_orange: "FF8909",
              black: "000000", dark_grey: "222222", grey: "77787B",
              white: "FFFFFF", light_grey: "F5F5F5", medium_grey: "666666",
            },
            font: "Aptos",
          }),
        }],
      };
    }
  );

  // ─── Tool: add element to a custom slide ───────────────────────────────
  server.tool(
    "pptx_add_element",
    "Add a creative element (text box, shape, chart, table) to a custom slide. Use this after pptx_add_custom_slide to build visually rich, creative slides. You can add multiple elements per slide. Be creative — use colored boxes, icon-style numbers, accent shapes, multi-column text, etc.",
    {
      presentation_id: z.string().describe("The presentation ID"),
      slide_index: z.number().describe("The slide_index from pptx_add_custom_slide"),
      element_type: z.enum(["text", "shape", "chart", "table"]).describe("Type of element to add"),
      props: z.record(z.any()).describe(
        `Element properties (all positions in inches, slide is 13.33x7.50):

TEXT: {x, y, w, h, text (string or [{text,options:{bold,italic,fontSize,color,fontFace}}]), fontSize, color, bold, italic, fontFace, align, valign, fill, bullet:{type:'bullet',color}, paraSpaceAfter, rectRadius, lineSpacing}

SHAPE: {x, y, w, h, shape ('rect','ellipse','roundRect','line'), fill, line:{color,width}, rectRadius, rotate}

CHART: {x, y, w, h, chartType ('bar','line','pie','doughnut'), data:[{name,labels:[],values:[]}], chartColors:[], showValue, showLegend, legendPos}

TABLE: {x, y, w, h, rows (2D array of cell values), colW (array of column widths), rowH, fontSize, color, headerFill, headerColor, border:{type,color,pt}, autoPage}`
      ),
    },
    async ({ presentation_id, slide_index, element_type, props }) => {
      const pres = presentations.get(presentation_id);
      if (!pres) return { content: [{ type: "text", text: "Error: Presentation not found." }], isError: true };
      const slide = pres.slides && pres.slides[slide_index];
      if (!slide) return { content: [{ type: "text", text: `Error: Slide ${slide_index} not found. Use pptx_add_custom_slide first.` }], isError: true };

      try {
        addElementToSlide(slide, pres.pptx, element_type, props);
        return {
          content: [{ type: "text", text: JSON.stringify({ message: `${element_type} element added to slide ${slide_index}` }) }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error adding element: ${err.message}` }], isError: true };
      }
    }
  );

  // ─── Tool: BATCH add elements to a custom slide ──────────────────────────
  server.tool(
    "pptx_add_elements",
    "Add MULTIPLE elements to a custom slide in ONE call. This is the PREFERRED tool for complex/dashboard slides — use this instead of calling pptx_add_element repeatedly. Pass an array of elements (shapes, text boxes, charts, tables) and they are all rendered in order.",
    {
      presentation_id: z.string().describe("The presentation ID"),
      slide_index: z.number().describe("The slide_index from pptx_add_custom_slide"),
      elements: z.array(z.object({
        type: z.enum(["text", "shape", "chart", "table"]).describe("Element type"),
        props: z.record(z.any()).describe("Element properties — same format as pptx_add_element props"),
      })).describe("Array of elements to add. Each has {type, props}. Rendered in order (first = bottom layer)."),
    },
    async ({ presentation_id, slide_index, elements }) => {
      const pres = presentations.get(presentation_id);
      if (!pres) return { content: [{ type: "text", text: "Error: Presentation not found." }], isError: true };
      const slide = pres.slides && pres.slides[slide_index];
      if (!slide) return { content: [{ type: "text", text: `Error: Slide ${slide_index} not found. Use pptx_add_custom_slide first.` }], isError: true };

      const errors = [];
      let added = 0;
      for (let i = 0; i < (elements || []).length; i++) {
        const { type, props } = elements[i];
        try {
          addElementToSlide(slide, pres.pptx, type, props);
          added++;
        } catch (err) {
          errors.push(`Element ${i} (${type}): ${err.message}`);
        }
      }

      const result = { message: `${added} elements added to slide ${slide_index}`, total_elements: added };
      if (errors.length) result.warnings = errors;
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Tool: export ──────────────────────────────────────────────────────
  server.tool(
    "pptx_export",
    "Export the presentation as a .pptx file",
    {
      presentation_id: z.string().describe("The presentation ID"),
      output_path: z.string().optional().describe("Output file path. Defaults to ./output/<title>.pptx"),
    },
    async ({ presentation_id, output_path }) => {
      const pres = presentations.get(presentation_id);
      if (!pres) return { content: [{ type: "text", text: "Error: Presentation not found." }], isError: true };
      const sanitized = (pres.title || "presentation").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
      const defaultDir = BRAND.getOutputDir();
      const filePath = output_path ? path.resolve(output_path) : path.join(defaultDir, `${sanitized}.pptx`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      await pres.pptx.writeFile({ fileName: filePath });
      return {
        content: [{ type: "text", text: JSON.stringify({ message: "Presentation exported", file_path: filePath, total_slides: pres.slideCount }) }],
      };
    }
  );

  // ─── Tool: delete ──────────────────────────────────────────────────────
  server.tool(
    "pptx_delete",
    "Delete a presentation from memory",
    { presentation_id: z.string().describe("The presentation ID") },
    async ({ presentation_id }) => {
      if (presentations.delete(presentation_id)) {
        return { content: [{ type: "text", text: "Presentation deleted." }] };
      }
      return { content: [{ type: "text", text: "Not found." }], isError: true };
    }
  );

  // ─── Tool: ONE-SHOT generate full presentation ──────────────────────────
  server.tool(
    "pptx_generate",
    "Generate a complete Tavant-branded PowerPoint presentation in ONE call. Pass all slides at once — no need for pptx_create/pptx_add_slide/pptx_export. This is the PREFERRED tool for creating presentations. Use pptx_list_layouts to see available layouts and fields.",
    {
      title: z.string().optional().describe("Presentation title"),
      author: z.string().optional().describe("Author name"),
      slides: z.array(z.object({
        layout: z.string().describe("Layout ID: title_cover, agenda, breaker_ai, breaker_cloud, breaker_abstract, blank, title_only, title_only_dark, content_dark, content, title_subtitle, two_column, title_subtitle_content, multi_case_study, image_content_a, image_content_b, image_grid, three_column_images, chart, timeline_vertical, timeline_horizontal, multi_quote, thank_you"),
        data: z.record(z.any()).describe("Slide content data — fields depend on layout. Use pptx_list_layouts to see fields."),
      })).describe("Array of slides, each with a layout ID and data object"),
      output_path: z.string().optional().describe("Output file path. Defaults to ~/Documents/TavantDocs/<title>.pptx"),
    },
    async ({ title, author, slides, output_path }) => {
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE";
      pptx.title = title || "Tavant Presentation";
      pptx.author = author || "Tavant";
      pptx.company = "Tavant";

      const errors = [];
      let slideCount = 0;

      for (const { layout, data } of (slides || [])) {
        const builder = slideBuilders[layout];
        if (!builder) {
          errors.push(`Unknown layout "${layout}" — skipped. Available: ${Object.keys(LAYOUTS).join(", ")}`);
          continue;
        }
        try {
          builder(pptx, data || {});
          slideCount++;
        } catch (err) {
          errors.push(`Error on slide ${slideCount + 1} (${layout}): ${err.message}`);
        }
      }

      if (slideCount === 0) {
        return { content: [{ type: "text", text: "Error: No valid slides to generate." }], isError: true };
      }

      const sanitized = (pptx.title || "presentation").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
      const defaultDir = BRAND.getOutputDir();
      const filePath = output_path ? path.resolve(output_path) : path.join(defaultDir, `${sanitized}.pptx`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      await pptx.writeFile({ fileName: filePath });

      const result = { message: "Presentation generated", file_path: filePath, total_slides: slideCount };
      if (errors.length) result.warnings = errors;
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}

module.exports = { register };
