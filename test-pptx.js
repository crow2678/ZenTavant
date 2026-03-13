#!/usr/bin/env node
/**
 * Quick test: Generate a presentation using ALL 23 layouts from the real corporate template.
 */
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const path = require("path");

(async () => {
  console.log("=== PPTX Corporate Template Test ===\n");
  const transport = new StdioClientTransport({ command: "node", args: [path.join(__dirname, "index.js")] });
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(transport);

  const pres = await client.callTool({ name: "pptx_create", arguments: { title: "Tavant AI Strategy 2026", author: "Paresh" } });
  const pid = JSON.parse(pres.content[0].text).presentation_id;

  const slides = [
    { layout: "title_cover", data: { title: "TAVANT AI STRATEGY\nQ4 2026", subtitle: "Transforming Enterprise with Generative AI", date: "December 2026" } },
    { layout: "agenda", data: { items: ["AI Platform Overview", "Key Achievements", "Strategic Priorities", "Product Roadmap", "Investment", "Q&A"] } },
    { layout: "breaker_ai", data: { title: "AI PLATFORM OVERVIEW", key_points: ["75+ Data Scientists", "Multi-LLM Architecture", "Enterprise-grade Security"] } },
    { layout: "breaker_cloud", data: { title: "CLOUD TRANSFORMATION" } },
    { layout: "breaker_abstract", data: { title: "DATA & ANALYTICS" } },
    { layout: "content", data: { title: "Our AI Platform Capabilities", body: ["End-to-end AI/ML lifecycle management", "Custom model training and fine-tuning", "RAG pipelines for enterprise knowledge", "Multi-modal AI support", "Built-in MLOps for continuous deployment"] } },
    { layout: "title_subtitle_content", data: { title: "GenAI Services Portfolio", subtitle: "Enterprise-grade AI solutions across verticals", body: ["Customer Service Agents — automated CS for gaming, mortgage, and agriculture", "Supply Chain Agents — demand forecasting, workforce orchestration", "Productivity Assistants — ad sales, loan officer, field service", "Enterprise Function Agents — finance, HR, IT automation"] } },
    { layout: "content_dark", data: { title: "Why Agentic AI Matters", body: ["Agents autonomously execute multi-step workflows", "Reduce manual processing by 85%", "10,000+ claims processed daily with 92% STP rate", "Average resolution time: 5 days → 4 hours"] } },
    { layout: "title_subtitle", data: { title: "Q3 KEY ACHIEVEMENTS", subtitle: "Delivering measurable impact across all practice areas" } },
    { layout: "two_column", data: { title: "Strategic Priorities", subtitle: "Balanced investment across growth and efficiency", left_content: ["Scale AI platform to 100+ models", "Enterprise RAG for all clients", "AI Agent framework v1.0"], right_content: ["50% inference cost reduction", "SOC2 & HIPAA AI governance", "AWS, Azure, GCP partnerships"] } },
    { layout: "title_only", data: { title: "DETAILED ARCHITECTURE" } },
    { layout: "title_only_dark", data: { title: "COMPETITIVE LANDSCAPE" } },
    { layout: "blank", data: {} },
    { layout: "multi_case_study", data: { title: "CLIENT SUCCESS STORIES", subtitle: "Proven delivery across industries", columns: [
      { title: "Global Gaming", description: "Customer service automation handling 50K+ tickets/month with 90% resolution rate" },
      { title: "US Mortgage", description: "End-to-end agentic orchestration for loan origination reducing processing by 70%" },
      { title: "Agriculture", description: "Yield forecasting and workforce orchestration for world's largest palm oil producer" },
      { title: "Media", description: "Ad sales assistant with campaign optimization driving 40% revenue uplift" },
    ] } },
    { layout: "image_content_a", data: { title: "AIgnite™ Platform", subtitle: "Enterprise AI Accelerator", body: ["Pre-built GenAI agents for rapid deployment", "Multi-LLM & advanced retrieval", "Enterprise security & governance", "Dynamic orchestration for complex workflows"], image_description: "AIgnite Platform Dashboard" } },
    { layout: "image_content_b", data: { title: "DATA TRANSFORMATION", subtitle: "Migration & Modernization", topic_1: { title: "Cloud Migration", description: "Re-platform legacy to Snowflake, Databricks, Azure Synapse" }, topic_2: { title: "Data Ops", description: "Real-time observability, auto-healing, cost optimization" }, body: "400+ associates, 100+ certifications, 30+ major implementations across Mortgage, Fintech, Media, Travel, Manufacturing" } },
    { layout: "image_grid", data: { title: "CORE CAPABILITIES", subtitle: "End-to-end Digital, AI, Data & Platform", grid_items: [
      { title: "Digital Engineering", description: "GenAI-accelerated development" },
      { title: "Agentic AI", description: "Multi-agent orchestration" },
      { title: "Data Science", description: "AI/ML models & cognitive solutions" },
      { title: "Data Platform", description: "Cloud modernization & governance" },
      { title: "AI Platform", description: "Industry-specific accelerators" },
      { title: "AIgnite™", description: "Enterprise AI transformation" },
    ] } },
    { layout: "three_column_images", data: { title: "TECHNOLOGY PARTNERS", subtitle: "Best-in-class ecosystem", columns: [
      { title: "Cloud & Infra", description: "AWS, Azure, GCP, Databricks, Snowflake" },
      { title: "AI & ML", description: "TensorFlow, PyTorch, SageMaker, Bedrock, Vertex AI" },
      { title: "Agent Frameworks", description: "LangChain, LangGraph, CrewAI, AutoGen, Atomic Agents" },
    ] } },
    { layout: "chart", data: { title: "REVENUE GROWTH", subtitle: "AI Services revenue trajectory", body: ["AI services growing 270% YoY", "3 new enterprise deals closing in Q4", "Platform licensing model launching Q1 2027"], takeaway: "Projected $7.8M Q4 revenue — highest quarter ever", chart_data: { labels: ["Q1", "Q2", "Q3", "Q4 Proj"], values: [2.1, 3.4, 5.2, 7.8] } } },
    { layout: "timeline_vertical", data: { title: "IMPACT METRICS", subtitle: "AIOps for Data Platforms — 90-day results", body: "Cut MTTR 50-70% and raise SLA adherence to 90-95% in ≤90 days", blocks: [
      { label: "MTTR Reduction", value: "50-70%", description: "Auto-triage + safe actions" },
      { label: "SLA Adherence", value: "90-95%", description: "Predictive breach alerts" },
      { label: "DQ Incidents", value: "↓ 40-60%", description: "Proactive drift checks" },
    ], year_highlight: "2026" } },
    { layout: "timeline_horizontal", data: { title: "PRODUCT ROADMAP", subtitle: "Key milestones through 2027", milestones: [
      { date: "Oct '26", label: "AI Agent Framework v1.0" },
      { date: "Nov '26", label: "Enterprise RAG GA" },
      { date: "Dec '26", label: "Multi-modal AI" },
      { date: "Jan '27", label: "AI Governance Dashboard" },
      { date: "Feb '27", label: "Partner Marketplace" },
      { date: "Mar '27", label: "Self-service AI Studio" },
      { date: "Apr '27", label: "Edge AI Support" },
    ] } },
    { layout: "multi_quote", data: { title: "CLIENT TESTIMONIALS", subtitle: "What our partners say", quotes: [
      { company: "Global Gaming Co", title: "VP Engineering", text: "Tavant's AI agents transformed our customer service — 90% auto-resolution rate within 3 months." },
      { company: "US Mortgage Leader", title: "CTO", text: "The agentic orchestration platform reduced our loan processing time by 70%. Game-changing." },
      { company: "AgriTech Giant", title: "Head of Digital", text: "Workforce orchestration and yield forecasting delivered 25% productivity improvement in first season." },
    ] } },
    { layout: "thank_you", data: { contact_email: "hello@tavant.com", contact_website: "www.tavant.com", contact_phone: "+1-866-9-TAVANT" } },
  ];

  for (const s of slides) {
    const r = await client.callTool({ name: "pptx_add_slide", arguments: { presentation_id: pid, layout: s.layout, data: s.data } });
    const info = JSON.parse(r.content[0].text);
    if (info.message) {
      console.log(`  Slide ${info.slide_number}: ${s.layout}`);
    } else {
      console.log(`  ERROR on ${s.layout}: ${r.content[0].text}`);
    }
  }

  const outPath = path.join(__dirname, "output", "Corporate_Template_Test.pptx");
  await client.callTool({ name: "pptx_export", arguments: { presentation_id: pid, output_path: outPath } });
  console.log(`\nExported: ${outPath}`);
  console.log(`Total slides: ${slides.length}`);

  await client.close();
  process.exit(0);
})().catch(e => { console.error("FAILED:", e); process.exit(1); });
