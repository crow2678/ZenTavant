# PPTX Generation Best Practices — Tavant Universe MCP

## Tool Call Workflow (follow this order)
1. `get_brand_guidelines` — always call first
2. `pptx_list_layouts` — review available templates
3. `pptx_create` — one call, returns presentation_id
4. Plan ALL slides upfront before adding any
5. `pptx_add_slide` — for template-matching slides (1 call each)
6. `pptx_add_custom_slide` + `pptx_add_element` — only when no template fits
7. `pptx_export` — one call at the end

## Layout Selection Guide — Match Content to Layout

| Content Type | Best Layout | Why |
|---|---|---|
| Opening slide | `title_cover` | Dark bg, large title, subtitle, date |
| Agenda / TOC | `agenda` | Numbered orange items (max 6, keep under 40 chars each) |
| Section divider | `breaker_ai`, `breaker_cloud`, `breaker_abstract` | Full-bleed imagery, bold title |
| General bullets | `content` | Title + bulleted body |
| Title + subtitle + bullets | `title_subtitle_content` | Most versatile layout |
| Comparison / two lists | `two_column` | Side-by-side columns |
| Content + image | `image_content_a` | Text left, image placeholder right |
| Dark analysis + topics | `image_content_b` | Image left, 2 topic boxes right |
| Capability overview (6 items) | `image_grid` | 2x3 grid blocks |
| 3 services/features | `three_column_images` | 3 image slots + 3 text blocks |
| 4 case studies | `multi_case_study` | 4 white card columns |
| Chat examples / prompts | `three_column_images` or `multi_case_study` | Labelled blocks with separation |
| Data / metrics | `chart` | Content left + chart right |
| KPIs over time | `timeline_vertical` | 3 stat blocks + year |
| Roadmap / milestones | `timeline_horizontal` | 8 date points on timeline |
| Testimonials | `multi_quote` | 3 rows with quote text |
| Dark bullet list (4 items) | `content_dark` | Orange text on dark grey |
| Step-by-step instructions | `pptx_add_custom_slide` | No template fits — use numbered shapes |
| UI walkthrough | `image_content_a` | Has image slot for screenshots |
| Closing | `thank_you` | Contact info, office locations |

## DO NOT use these layouts for:
- `content` for step-by-step instructions (use custom slide with numbered shapes)
- `two_column` for UI walkthroughs (use `image_content_a` with image placeholder)
- `content` for 10+ items (split across 2 slides or use `image_grid`)
- `two_column` for capability grids (use `image_grid` for 6 items)

## Golden Rules
1. **Always prefer `pptx_add_slide` (1 call) over `pptx_add_custom_slide` + elements (N calls)**
2. **Plan all slides upfront, then execute in one pass** — never interleave planning and building
3. **Keep agenda items under 40 characters** — long items cause wrapping
4. **Pass body as string array** — `["item 1", "item 2", "item 3"]` not one long string
5. **For custom slides, minimize element calls:**
   - Combine text into rich arrays `[{text, options}]` instead of separate calls
   - Use `table` element to replace 6-8 individual text boxes
6. **Start with `title_cover`, end with `thank_you`**
7. **Use breaker slides between major sections** for visual rhythm

## Optimal Call Count
- 9-slide deck with smart layout selection: ~23-28 calls total
- Template slides: 1 call each
- Custom slides: 1 + ~4-8 element calls each
- Avoid: everything as custom slides (80-100+ calls)
