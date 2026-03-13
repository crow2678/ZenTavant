const fs = require("fs");
const path = require("path");
const BRAND = require("../../brand");

const ASSETS = path.join(__dirname, "..", "..", "assets");
const img = (name) => path.join(ASSETS, name);

// ─── Common elements matching the real template ─────────────────────────
// Footer: black bar with orange triangle at bottom + "Tavant & Customer Confidential" + slide number
function addWhiteSlideChrome(slide, pptx) {
  // Footer bar image (black bar with orange triangle)
  if (fs.existsSync(img("footer-bar.png"))) {
    slide.addImage({ path: img("footer-bar.png"), x: 0, y: 6.83, w: 13.33, h: 0.67 });
  }
  // Tavant logo — LEFT bottom (on footer bar)
  if (fs.existsSync(img("tavant-logo-small.png"))) {
    slide.addImage({ path: img("tavant-logo-small.png"), x: 0.29, y: 7.07, w: 1.38, h: 0.38 });
  }
  // Confidential footer text — black, single line
  slide.addText("Tavant & Customer Confidential", {
    x: 9.5, y: 7.15, w: 3.0, h: 0.18,
    fontSize: 10.7, color: BRAND.colors.black, fontFace: BRAND.font, wrap: false,
  });
}

function addDarkSlideChrome(slide, pptx) {
  if (fs.existsSync(img("footer-bar.png"))) {
    slide.addImage({ path: img("footer-bar.png"), x: 0, y: 6.83, w: 13.33, h: 0.67 });
  }
  // Tavant logo — LEFT bottom (on footer bar)
  if (fs.existsSync(img("tavant-logo-small.png"))) {
    slide.addImage({ path: img("tavant-logo-small.png"), x: 0.29, y: 7.07, w: 1.38, h: 0.38 });
  }
  slide.addText("Tavant & Customer Confidential", {
    x: 9.5, y: 7.15, w: 3.0, h: 0.18,
    fontSize: 10.7, color: BRAND.colors.black, fontFace: BRAND.font, wrap: false,
  });
}

// Standard title bar (used on most content slides)
function addTitle(slide, title, opts = {}) {
  slide.addText(title || "", {
    x: opts.x || 0.36, y: opts.y || 0.37, w: opts.w || 12.62, h: 0.39,
    fontSize: 24, bold: true, color: BRAND.colors.black, fontFace: BRAND.font,
    ...opts,
  });
}

function addSubtitle(slide, subtitle, opts = {}) {
  if (!subtitle) return;
  slide.addText(subtitle, {
    x: opts.x || 0.36, y: opts.y || 0.78, w: opts.w || 12.62, h: 0.41,
    fontSize: 18, color: "F77A33", fontFace: BRAND.font,
    ...opts,
  });
}

// ─── Slide Builders ─────────────────────────────────────────────────────
const slideBuilders = {

  // ── SLIDE 1: Title Cover ──────────────────────────────────────────────
  title_cover(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.black };
    // Background tech imagery (right side)
    if (fs.existsSync(img("bg-title-tech.jpeg"))) {
      slide.addImage({ path: img("bg-title-tech.jpeg"), x: 0, y: 0, w: 13.33, h: 7.50 });
    }
    // Orange Tavant logo (large)
    if (fs.existsSync(img("tavant-logo-orange.png"))) {
      slide.addImage({ path: img("tavant-logo-orange.png"), x: 0.46, y: 5.73, w: 2.0, h: 0.49 });
    }
    // Tagline
    slide.addText("Unlocking the power of AI. Accelerating digital transformation.", {
      x: 0.46, y: 6.30, w: 5.0, h: 0.30,
      fontSize: 10, color: BRAND.colors.orange, fontFace: BRAND.font,
    });
    // Title (up to 3 lines)
    slide.addText(data.title || "PRESENTATION TITLE", {
      x: 0.49, y: 1.91, w: 6.02, h: 1.75,
      fontSize: 40, bold: true, color: BRAND.colors.black, fontFace: BRAND.font,
    });
    // Subtitle
    if (data.subtitle) {
      slide.addText(data.subtitle, {
        x: 0.49, y: 3.91, w: 6.02, h: 0.50,
        fontSize: 18, color: "F77A33", fontFace: BRAND.font,
      });
    }
    // Date
    if (data.date) {
      slide.addText(data.date, {
        x: 0.49, y: 4.67, w: 6.02, h: 0.39,
        fontSize: 18, color: BRAND.colors.black, fontFace: BRAND.font,
      });
    }
  },

  // ── SLIDE 2: Agenda ───────────────────────────────────────────────────
  agenda(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: "222222" };
    // Background data imagery
    if (fs.existsSync(img("bg-agenda-data.jpeg"))) {
      slide.addImage({ path: img("bg-agenda-data.jpeg"), x: 5.0, y: 0, w: 8.33, h: 7.50 });
    }
    // Decorative cubes top-right
    if (fs.existsSync(img("decor-cubes.png"))) {
      slide.addImage({ path: img("decor-cubes.png"), x: 11.5, y: 0, w: 1.83, h: 1.50 });
    }
    // Tavant logo
    if (fs.existsSync(img("tavant-logo-small.png"))) {
      slide.addImage({ path: img("tavant-logo-small.png"), x: 12.63, y: 7.02, w: 0.28, h: 0.28 });
    }
    // Footer bar
    if (fs.existsSync(img("footer-bar.png"))) {
      slide.addImage({ path: img("footer-bar.png"), x: 0, y: 6.83, w: 13.33, h: 0.67 });
    }
    slide.addText("Tavant & Customer Confidential", {
      x: 9.5, y: 7.15, w: 3.0, h: 0.18,
      fontSize: 10.7, color: BRAND.colors.black, fontFace: BRAND.font, wrap: false,
    });
    // AGENDA title
    slide.addText("AGENDA", {
      x: 0.40, y: 0.39, w: 3.09, h: 0.79,
      fontSize: 24, bold: true, color: BRAND.colors.orange, fontFace: BRAND.font,
    });
    // Numbered items
    const items = data.items || [];
    const itemTexts = items.map((item, i) => ({
      text: `${String(i + 1).padStart(2, "0")}  ${item}`,
      options: {
        fontSize: 20, bold: true, color: BRAND.colors.orange, fontFace: BRAND.font,
        paraSpaceAfter: 14, bullet: false,
      },
    }));
    slide.addText(itemTexts, {
      x: 0.40, y: 1.31, w: 6.87, h: 5.28, valign: "top",
    });
  },

  // ── SLIDES 3-5: Breaker slides ────────────────────────────────────────
  breaker_ai(pptx, data) { buildBreaker(pptx, data, "bg-breaker-brain.jpeg"); },
  breaker_cloud(pptx, data) { buildBreaker(pptx, data, "bg-breaker-cloud.jpeg"); },
  breaker_abstract(pptx, data) { buildBreaker(pptx, data, "bg-breaker-lines.jpeg"); },

  // ── SLIDE 6: Blank ────────────────────────────────────────────────────
  blank(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.white };
    addWhiteSlideChrome(slide, pptx);
  },

  // ── SLIDE 7: Title Only (White) ───────────────────────────────────────
  title_only(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.white };
    addTitle(slide, data.title);
    addWhiteSlideChrome(slide, pptx);
  },

  // ── SLIDE 8: Title Only (Dark) ────────────────────────────────────────
  title_only_dark(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: "222222" };
    addTitle(slide, data.title, { color: BRAND.colors.white });
    addDarkSlideChrome(slide, pptx);
  },

  // ── SLIDE 9: Title + Content (Dark) ───────────────────────────────────
  content_dark(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: "222222" };
    addTitle(slide, data.title, { color: BRAND.colors.white });
    if (data.body) {
      const bodyItems = Array.isArray(data.body)
        ? data.body.map(b => ({
            text: b,
            options: { fontSize: 18, color: "FF8909", fontFace: BRAND.font, bullet: { type: "bullet", color: "FF8909" }, paraSpaceAfter: 8 },
          }))
        : [{ text: data.body, options: { fontSize: 18, color: "FF8909", fontFace: BRAND.font } }];
      slide.addText(bodyItems, { x: 0.36, y: 1.07, w: 12.62, h: 5.58, valign: "top" });
    }
    addDarkSlideChrome(slide, pptx);
  },

  // ── SLIDE 10: Title + Content (White) ─────────────────────────────────
  content(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.white };
    addTitle(slide, data.title);
    if (data.body) {
      const bodyItems = Array.isArray(data.body)
        ? data.body.map(b => ({
            text: b,
            options: { fontSize: 18, color: BRAND.colors.darkGray, fontFace: BRAND.font, bullet: { type: "bullet", color: "FF8909" }, paraSpaceAfter: 8 },
          }))
        : [{ text: data.body, options: { fontSize: 18, color: BRAND.colors.darkGray, fontFace: BRAND.font } }];
      slide.addText(bodyItems, { x: 0.36, y: 1.07, w: 12.62, h: 5.58, valign: "top" });
    }
    addWhiteSlideChrome(slide, pptx);
  },

  // ── SLIDE 11: Title + Subtitle ────────────────────────────────────────
  title_subtitle(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.white };
    addTitle(slide, data.title);
    addSubtitle(slide, data.subtitle);
    addWhiteSlideChrome(slide, pptx);
  },

  // ── SLIDE 12: Title + 2-Column Content ────────────────────────────────
  two_column(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.white };
    addTitle(slide, data.title);
    addSubtitle(slide, data.subtitle);

    const buildCol = (content) => {
      if (!content) return [];
      if (Array.isArray(content)) {
        return content.map(b => ({
          text: b,
          options: { fontSize: 18, color: BRAND.colors.darkGray, fontFace: BRAND.font, bullet: { type: "bullet", color: "FF8909" }, paraSpaceAfter: 8 },
        }));
      }
      return [{ text: content, options: { fontSize: 18, color: BRAND.colors.darkGray, fontFace: BRAND.font } }];
    };

    slide.addText(buildCol(data.left_content), { x: 0.35, y: 1.39, w: 6.18, h: 5.27, valign: "top" });
    slide.addText(buildCol(data.right_content), { x: 6.80, y: 1.39, w: 6.18, h: 5.27, valign: "top" });
    addWhiteSlideChrome(slide, pptx);
  },

  // ── SLIDE 13: Title + Subtitle + Content ──────────────────────────────
  title_subtitle_content(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.white };
    addTitle(slide, data.title);
    addSubtitle(slide, data.subtitle);
    if (data.body) {
      const bodyItems = Array.isArray(data.body)
        ? data.body.map(b => ({
            text: b,
            options: { fontSize: 18, color: BRAND.colors.darkGray, fontFace: BRAND.font, bullet: { type: "bullet", color: "FF8909" }, paraSpaceAfter: 8 },
          }))
        : [{ text: data.body, options: { fontSize: 18, color: BRAND.colors.darkGray, fontFace: BRAND.font } }];
      slide.addText(bodyItems, { x: 0.35, y: 1.38, w: 12.63, h: 5.30, valign: "top" });
    }
    addWhiteSlideChrome(slide, pptx);
  },

  // ── SLIDE 14: Multi-Case Study (4 columns, black bg) ─────────────────
  multi_case_study(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.black };
    addTitle(slide, data.title, { color: BRAND.colors.white });
    addSubtitle(slide, data.subtitle);

    const columns = data.columns || [];
    const xPositions = [0.64, 3.76, 6.88, 10.01];
    columns.slice(0, 4).forEach((col, i) => {
      const x = xPositions[i];
      // White card background
      slide.addShape(pptx.ShapeType.rect, {
        x: x - 0.13, y: 1.46, w: 2.95, h: 5.07,
        fill: { color: BRAND.colors.white }, rectRadius: 0.05,
      });
      // Orange accent line
      slide.addShape(pptx.ShapeType.rect, {
        x: x + 1.20, y: 5.02, w: 0.07, h: 0.50,
        fill: { color: BRAND.colors.orange },
      });
      const title = typeof col === "string" ? col : col.title || "";
      const desc = typeof col === "string" ? "" : col.description || "";
      // Text content
      const textItems = [];
      if (title) {
        textItems.push({ text: title, options: { fontSize: 14, bold: true, color: BRAND.colors.black, fontFace: BRAND.font, paraSpaceAfter: 6 } });
      }
      if (desc) {
        textItems.push({ text: desc, options: { fontSize: 12, color: BRAND.colors.darkGray, fontFace: BRAND.font } });
      }
      if (textItems.length) {
        slide.addText(textItems, { x, y: 3.00, w: 2.69, h: 2.59, valign: "top" });
      }
    });
    addDarkSlideChrome(slide, pptx);
  },

  // ── SLIDE 15: Image + Content A (image right) ────────────────────────
  image_content_a(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.white };
    addTitle(slide, data.title, { w: 7.16 });
    addSubtitle(slide, data.subtitle, { w: 7.16 });
    // Image placeholder on right
    slide.addShape(pptx.ShapeType.rect, {
      x: 6.86, y: 1.31, w: 5.72, h: 4.80,
      fill: { color: "E8E8E8" }, rectRadius: 0.05,
    });
    if (data.image_description) {
      slide.addText(data.image_description, {
        x: 7.1, y: 3.0, w: 5.2, h: 1.0,
        fontSize: 12, italic: true, color: BRAND.colors.mediumGray, fontFace: BRAND.font, align: "center",
      });
    }
    // Content left
    if (data.body) {
      const bodyItems = Array.isArray(data.body)
        ? data.body.map(b => ({
            text: b,
            options: { fontSize: 18, color: BRAND.colors.darkGray, fontFace: BRAND.font, bullet: { type: "bullet", color: "FF8909" }, paraSpaceAfter: 8 },
          }))
        : [{ text: data.body, options: { fontSize: 18, color: BRAND.colors.darkGray, fontFace: BRAND.font } }];
      slide.addText(bodyItems, { x: 0.39, y: 1.64, w: 6.13, h: 5.01, valign: "top" });
    }
    addWhiteSlideChrome(slide, pptx);
  },

  // ── SLIDE 16: Image + Content B (image left, black bg) ───────────────
  image_content_b(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.black };
    addTitle(slide, data.title, { color: BRAND.colors.white });
    addSubtitle(slide, data.subtitle);
    // Image placeholder left
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 1.31, w: 4.60, h: 5.52,
      fill: { color: "333333" },
    });
    // Two topic boxes on right
    const topics = [data.topic_1, data.topic_2].filter(Boolean);
    const topicX = [5.12, 9.33];
    topics.forEach((topic, i) => {
      const t = typeof topic === "string" ? { title: topic } : topic;
      const items = [];
      if (t.title) items.push({ text: `0${i + 1}. ${t.title}`, options: { fontSize: 16, bold: true, color: BRAND.colors.black, fontFace: BRAND.font, paraSpaceAfter: 4 } });
      if (t.description) items.push({ text: t.description, options: { fontSize: 12, color: BRAND.colors.darkGray, fontFace: BRAND.font } });
      slide.addShape(pptx.ShapeType.rect, {
        x: topicX[i], y: 2.09, w: 3.59, h: 1.51,
        fill: { color: BRAND.colors.white }, rectRadius: 0.05,
      });
      if (items.length) {
        slide.addText(items, { x: topicX[i] + 0.15, y: 2.15, w: 3.29, h: 1.40, valign: "top" });
      }
    });
    // Body content below
    if (data.body) {
      slide.addText(data.body, {
        x: 4.86, y: 4.07, w: 8.10, h: 2.81,
        fontSize: 16, color: BRAND.colors.orange, fontFace: BRAND.font, valign: "top",
      });
    }
    addDarkSlideChrome(slide, pptx);
  },

  // ── SLIDE 17: Image + Content Grid (2x3) ─────────────────────────────
  image_grid(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.white };
    // Image area at top
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 13.33, h: 3.07,
      fill: { color: "E8E8E8" },
    });
    // Title overlaid on image
    slide.addText(data.title || "", {
      x: 1.33, y: 0.68, w: 10.67, h: 0.57,
      fontSize: 40, color: BRAND.colors.white, fontFace: BRAND.font,
    });
    if (data.subtitle) {
      slide.addText(data.subtitle, {
        x: 1.30, y: 1.66, w: 10.68, h: 0.43,
        fontSize: 18, color: BRAND.colors.orange, fontFace: BRAND.font,
      });
    }
    // 2x3 grid
    const items = data.grid_items || [];
    const positions = [
      { x: 0.86, y: 3.40 }, { x: 5.06, y: 3.40 }, { x: 9.26, y: 3.40 },
      { x: 0.86, y: 5.16 }, { x: 5.06, y: 5.16 }, { x: 9.26, y: 5.16 },
    ];
    items.slice(0, 6).forEach((item, i) => {
      const pos = positions[i];
      const t = typeof item === "string" ? { title: item } : item;
      const texts = [];
      if (t.title) texts.push({ text: t.title, options: { fontSize: 16, bold: true, color: BRAND.colors.black, fontFace: BRAND.font, paraSpaceAfter: 4 } });
      if (t.description) texts.push({ text: t.description, options: { fontSize: 12, color: BRAND.colors.darkGray, fontFace: BRAND.font } });
      if (texts.length) {
        slide.addText(texts, { x: pos.x, y: pos.y, w: 3.38, h: 1.35, valign: "top" });
      }
    });
    addWhiteSlideChrome(slide, pptx);
  },

  // ── SLIDE 18: 3-Column with Images (black bg) ────────────────────────
  three_column_images(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.black };
    addTitle(slide, data.title, { color: BRAND.colors.white });
    addSubtitle(slide, data.subtitle);

    const columns = data.columns || [];
    const xPositions = [0.54, 4.81, 9.07];
    columns.slice(0, 3).forEach((col, i) => {
      const x = xPositions[i];
      // Image placeholder
      slide.addShape(pptx.ShapeType.rect, {
        x, y: 1.92, w: 3.71, h: 1.94,
        fill: { color: "333333" }, rectRadius: 0.05,
      });
      // White card below
      slide.addShape(pptx.ShapeType.rect, {
        x: x - 0.09, y: 4.04, w: 3.90, h: 2.26,
        fill: { color: BRAND.colors.white }, rectRadius: 0.05,
      });
      // Orange vertical accent
      slide.addShape(pptx.ShapeType.rect, {
        x: x + 1.83, y: 2.12, w: 0.06, h: 3.90,
        fill: { color: BRAND.colors.orange },
      });
      const t = typeof col === "string" ? { title: col } : col;
      const texts = [];
      if (t.title) texts.push({ text: `0${i + 1}. ${t.title}`, options: { fontSize: 20, bold: true, color: BRAND.colors.black, fontFace: BRAND.font, paraSpaceAfter: 6 } });
      if (t.description) texts.push({ text: t.description, options: { fontSize: 14, color: BRAND.colors.darkGray, fontFace: BRAND.font } });
      if (texts.length) {
        slide.addText(texts, { x: x + 0.14, y: 4.28, w: 3.48, h: 1.79, valign: "top" });
      }
    });
    addDarkSlideChrome(slide, pptx);
  },

  // ── SLIDE 19: Content + Chart ─────────────────────────────────────────
  chart(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: "77787B" };
    addTitle(slide, data.title, { color: BRAND.colors.white });
    addSubtitle(slide, data.subtitle);

    // Content area left
    if (data.body) {
      const bodyItems = Array.isArray(data.body)
        ? data.body.map(b => ({
            text: b,
            options: { fontSize: 18, color: BRAND.colors.white, fontFace: BRAND.font, bullet: { type: "bullet", color: "FF8909" }, paraSpaceAfter: 8 },
          }))
        : [{ text: data.body, options: { fontSize: 18, color: BRAND.colors.white, fontFace: BRAND.font } }];
      slide.addText(bodyItems, { x: 0.36, y: 1.59, w: 5.00, h: 3.46, valign: "top" });
    }

    // Key takeaway box
    if (data.takeaway) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.26, y: 5.36, w: 4.52, h: 1.32,
        fill: { color: BRAND.colors.orange }, rectRadius: 0.08,
      });
      slide.addText(data.takeaway, {
        x: 0.36, y: 5.40, w: 4.32, h: 1.24,
        fontSize: 14, color: BRAND.colors.white, fontFace: BRAND.font, valign: "middle",
      });
    }

    // Chart area right
    const chartData = data.chart_data || { labels: ["Q1", "Q2", "Q3", "Q4"], values: [30, 45, 60, 80] };
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.82, y: 1.45, w: 7.51, h: 5.32,
      fill: { color: BRAND.colors.white }, rectRadius: 0.05,
    });
    slide.addChart(pptx.ChartType.bar, [{
      name: chartData.series_name || "Series 1",
      labels: chartData.labels,
      values: chartData.values,
    }], {
      x: 6.28, y: 1.61, w: 6.69, h: 4.98,
      showValue: true, chartColors: [BRAND.colors.orange],
      catAxisFontSize: 11, valAxisFontSize: 10, dataLabelFontSize: 10,
    });
    addDarkSlideChrome(slide, pptx);
  },

  // ── SLIDE 20: Timeline (Vertical / KPI-style) ────────────────────────
  timeline_vertical(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.black };
    addTitle(slide, data.title, { w: 10.18, color: BRAND.colors.white });
    addSubtitle(slide, data.subtitle, { w: 10.18 });

    // Body text area
    if (data.body) {
      slide.addText(data.body, {
        x: 0.36, y: 1.58, w: 10.18, h: 1.77,
        fontSize: 16, color: BRAND.colors.mediumGray, fontFace: BRAND.font, valign: "top",
      });
    }

    // 3 KPI/stat blocks
    const blocks = data.blocks || [];
    const blockPositions = [
      { x: 0.35, y: 3.54, color: BRAND.colors.white },
      { x: 3.36, y: 3.54, color: "F77A33" },
      { x: 6.36, y: 3.54, color: BRAND.colors.white },
    ];
    blocks.slice(0, 3).forEach((block, i) => {
      const pos = blockPositions[i];
      const bgColor = i === 1 ? BRAND.colors.orange : BRAND.colors.white;
      const textColor = i === 1 ? BRAND.colors.white : BRAND.colors.black;
      slide.addShape(pptx.ShapeType.rect, {
        x: pos.x, y: pos.y, w: 2.80, h: 2.84,
        fill: { color: bgColor }, rectRadius: 0.05,
      });
      const t = typeof block === "string" ? { title: block } : block;
      const texts = [];
      if (t.label) texts.push({ text: t.label, options: { fontSize: 14, bold: true, color: textColor, fontFace: BRAND.font, paraSpaceAfter: 4 } });
      if (t.value) texts.push({ text: t.value, options: { fontSize: 32, bold: true, color: i === 1 ? BRAND.colors.white : BRAND.colors.orange, fontFace: BRAND.font, paraSpaceAfter: 6 } });
      if (t.description) texts.push({ text: t.description, options: { fontSize: 12, color: textColor === BRAND.colors.white ? "DDDDDD" : BRAND.colors.mediumGray, fontFace: BRAND.font } });
      if (texts.length) {
        slide.addText(texts, { x: pos.x + 0.15, y: pos.y + 0.15, w: 2.50, h: 2.54, valign: "top" });
      }
    });

    // Year highlight on right
    if (data.year_highlight) {
      slide.addText(data.year_highlight, {
        x: 10.29, y: 4.23, w: 3.05, h: 0.62,
        fontSize: 32, bold: true, color: BRAND.colors.orange, fontFace: BRAND.font,
      });
    }
    addDarkSlideChrome(slide, pptx);
  },

  // ── SLIDE 21: Timeline (Horizontal) ───────────────────────────────────
  timeline_horizontal(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: "F26F26" };
    addTitle(slide, data.title, { color: BRAND.colors.white });
    addSubtitle(slide, data.subtitle, { color: BRAND.colors.white });

    // Horizontal line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 2.27, w: 12.33, h: 0.05,
      fill: { color: BRAND.colors.white },
    });

    const milestones = data.milestones || [];
    const count = Math.min(milestones.length, 8);
    const dateXPositions = [0.75, 2.64, 4.34, 6.03, 7.73, 9.43, 11.13, 11.08];
    const dotXPositions = [1.40, 3.10, 4.80, 6.50, 8.20, 9.90, 11.60, 11.60];

    milestones.slice(0, 8).forEach((ms, i) => {
      const date = typeof ms === "string" ? ms : ms.date || "";
      const label = typeof ms === "string" ? "" : ms.label || ms.description || "";
      const isHighlight = i % 2 === 0;

      // Date label
      slide.addText(date, {
        x: dateXPositions[i] || (0.75 + i * 1.70), y: 1.61, w: 1.26, h: 0.64,
        fontSize: 18, color: BRAND.colors.white, fontFace: BRAND.font,
      });

      // Dot on timeline
      const dotColor = isHighlight ? "005CB9" : BRAND.colors.orange;
      slide.addShape(pptx.ShapeType.ellipse, {
        x: dotXPositions[i] || (1.40 + i * 1.70), y: 2.13, w: 0.33, h: 0.33,
        fill: { color: dotColor },
      });

      // Content block (alternating above/below line)
      if (label) {
        const yPos = isHighlight ? 2.96 : 4.70;
        const textColor = isHighlight ? BRAND.colors.white : "F77A33";
        slide.addText(label, {
          x: (0.23 + i * 1.70), y: yPos, w: 2.42, h: 1.53,
          fontSize: 14, bold: true, color: textColor, fontFace: BRAND.font, valign: "top",
        });
      }
    });
    addDarkSlideChrome(slide, pptx);
  },

  // ── SLIDE 22: Multi-Quote / Testimonials ──────────────────────────────
  multi_quote(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.black };
    addTitle(slide, data.title, { x: 2.16, w: 10.87, color: BRAND.colors.white });
    addSubtitle(slide, data.subtitle, { x: 2.16, w: 10.87 });

    const quotes = data.quotes || [];
    const yPositions = [1.67, 3.44, 5.20];
    quotes.slice(0, 3).forEach((quote, i) => {
      const y = yPositions[i];
      const q = typeof quote === "string" ? { text: quote } : quote;
      // Logo/image placeholder on left
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.09, y: y - 0.07, w: 2.88, h: 1.17,
        fill: { color: i === 1 ? BRAND.colors.white : "333333" }, rectRadius: 0.05,
      });
      if (q.company) {
        slide.addText(q.company, {
          x: 0.20, y: y, w: 2.66, h: 1.01,
          fontSize: 12, color: i === 1 ? BRAND.colors.black : BRAND.colors.white, fontFace: BRAND.font,
          align: "center", valign: "middle",
        });
      }
      // Quote text on right
      const texts = [];
      if (q.title || q.author) {
        texts.push({ text: `${q.title || q.author || ""}`, options: { fontSize: 16, bold: true, color: i === 1 ? BRAND.colors.white : BRAND.colors.black, fontFace: BRAND.font, paraSpaceAfter: 4 } });
      }
      const quoteText = q.text || q.quote || "";
      if (quoteText) {
        texts.push({ text: quoteText, options: { fontSize: 12, color: i === 1 ? "DDDDDD" : BRAND.colors.darkGray, fontFace: BRAND.font } });
      }
      // Card background for rows 0 and 2
      if (i !== 1) {
        slide.addShape(pptx.ShapeType.rect, {
          x: 3.50, y: y - 0.07, w: 9.40, h: 1.17,
          fill: { color: BRAND.colors.white }, rectRadius: 0.05,
        });
      }
      if (texts.length) {
        slide.addText(texts, {
          x: 3.60, y: y, w: 9.29, h: 1.01, valign: "middle",
        });
      }
    });
    addDarkSlideChrome(slide, pptx);
  },

  // ── SLIDE 23: Thank You ───────────────────────────────────────────────
  thank_you(pptx, data) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.colors.black };
    // Background imagery
    if (fs.existsSync(img("bg-thankyou.jpeg"))) {
      slide.addImage({ path: img("bg-thankyou.jpeg"), x: 0, y: 0, w: 13.33, h: 7.50 });
    }
    // Orange Tavant logo
    if (fs.existsSync(img("tavant-logo-orange.png"))) {
      slide.addImage({ path: img("tavant-logo-orange.png"), x: 0.46, y: 0.40, w: 2.5, h: 0.65 });
    }
    // THANK YOU text
    slide.addText("THANK YOU", {
      x: 3.51, y: 1.62, w: 6.31, h: 1.65,
      fontSize: 60, bold: true, color: BRAND.colors.white, fontFace: BRAND.font,
    });
    // Office locations
    slide.addText("Santa Clara  |  New York  |  Dallas  |  Mexico  |  Bangalore  |  Hyderabad  |  Noida  |  Pune", {
      x: 0, y: 5.85, w: 13.30, h: 0.77,
      fontSize: 14, color: BRAND.colors.orange, fontFace: BRAND.font, align: "center",
    });
    // Contact info
    const contactParts = [];
    if (data.contact_phone) contactParts.push(data.contact_phone);
    if (data.contact_email) contactParts.push(data.contact_email || "hello@tavant.com");
    if (data.contact_website) contactParts.push(data.contact_website || "www.tavant.com");
    if (contactParts.length === 0) {
      contactParts.push("+1-866-9-TAVANT", "hello@tavant.com", "www.tavant.com");
    }
    slide.addText(contactParts.join("  |  "), {
      x: 2.0, y: 6.24, w: 9.33, h: 0.40,
      fontSize: 14, color: BRAND.colors.white, fontFace: BRAND.font, align: "center",
    });
    // Footer
    slide.addText("Tavant & Customer Confidential", {
      x: 5.61, y: 7.12, w: 3.0, h: 0.18,
      fontSize: 10.67, color: BRAND.colors.black, fontFace: BRAND.font, wrap: false,
    });
    slide.addText("Tavant Proprietary & Confidential", {
      x: 9.5, y: 7.12, w: 3.0, h: 0.18,
      fontSize: 10.67, color: BRAND.colors.black, fontFace: BRAND.font, wrap: false,
    });
  },
};

// ─── Shared breaker builder ─────────────────────────────────────────────
function buildBreaker(pptx, data, bgImage) {
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.colors.black };
  // Full-bleed background
  if (fs.existsSync(img(bgImage))) {
    slide.addImage({ path: img(bgImage), x: 0, y: 0, w: 13.33, h: 7.50 });
  }
  // Footer bar
  if (fs.existsSync(img("footer-bar.png"))) {
    slide.addImage({ path: img("footer-bar.png"), x: 0, y: 6.83, w: 13.33, h: 0.67 });
  }
  // Tavant logo
  if (fs.existsSync(img("tavant-logo-small.png"))) {
    slide.addImage({ path: img("tavant-logo-small.png"), x: 12.63, y: 7.02, w: 0.28, h: 0.28 });
  }
  slide.addText("Tavant & Customer Confidential", {
    x: 9.5, y: 7.15, w: 3.0, h: 0.18,
    fontSize: 10.7, color: BRAND.colors.black, fontFace: BRAND.font, wrap: false,
  });
  // Title
  slide.addText(data.title || "SECTION TITLE", {
    x: 0.44, y: 2.78, w: 5.84, h: 0.47,
    fontSize: 24, bold: true, color: "F77A33", fontFace: BRAND.font,
  });
  // Key points below title
  if (data.key_points && data.key_points.length > 0) {
    const items = data.key_points.map(p => ({
      text: p,
      options: { fontSize: 16, color: BRAND.colors.orange, fontFace: BRAND.font, bullet: { type: "bullet", color: BRAND.colors.orange }, paraSpaceAfter: 6 },
    }));
    slide.addText(items, { x: 0.44, y: 3.59, w: 4.18, h: 1.50, valign: "top" });
  }
}

module.exports = slideBuilders;
