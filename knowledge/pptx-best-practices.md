# PPTX Generation Best Practices — Tavant Universe MCP

## Tool Call Workflow — PREFERRED (1 call)
1. `pptx_list_layouts` — review available templates
2. Plan ALL slides upfront
3. `pptx_generate` — pass all slides at once, produces .pptx in ONE call

## Tool Call Workflow — Custom/Dashboard Slides
1. `pptx_create` — returns presentation_id
2. `pptx_add_slide` — for template slides (1 call each)
3. `pptx_add_custom_slide` — for custom slides, returns slide_index
4. `pptx_add_elements` (BATCH) — add ALL elements to a custom slide in ONE call
5. `pptx_export` — save the file

## CRITICAL: Avoid Tool Limit
- **pptx_generate** = entire deck in 1 call (BEST)
- **pptx_add_elements** = all elements on a custom slide in 1 call (replaces N × pptx_add_element)
- NEVER call pptx_add_element one-by-one for complex slides — use pptx_add_elements batch

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
1. **Use `pptx_generate` for entire decks** — 1 tool call for all template slides
2. **Use `pptx_add_elements` (batch) for custom slides** — all shapes/text/charts in 1 call
3. **Plan all slides upfront, then execute in one pass** — never interleave planning and building
4. **Keep agenda items under 40 characters** — long items cause wrapping
5. **Pass body as string array** — `["item 1", "item 2", "item 3"]` not one long string
6. **Start with `title_cover`, end with `thank_you`**
7. **Use breaker slides between major sections** for visual rhythm

## Optimal Call Count
- 9-slide deck (all templates): **1 call** with pptx_generate
- 9-slide deck with 2 custom slides: **5 calls** (create + 7 add_slide as generate doesn't support custom + 2 custom_slide + 2 add_elements + export) — or just use pptx_generate for the 7 template slides + separate custom flow
- Dashboard slide with 30+ elements: **1 call** with pptx_add_elements batch
- AVOID: calling pptx_add_element 50+ times (hits tool limit)
