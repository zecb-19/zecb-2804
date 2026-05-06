import "server-only";

import { pool } from "@/lib/db";
import { log } from "@/lib/log";
import { chatWithUsage } from "@/lib/llm/openrouter";
import type { CoreMessagePayload } from "./core-message";

export type ContentCategory = "problem_aware" | "solution_aware" | "tool_howto" | "data_research";

export type ArticlePlan = {
  title: string;
  slug: string;
  category: ContentCategory;
  target_keyword: string;
  outline: string[];
  word_count_target: number;
  internal_links: string[];
};

/**
 * PRD §8.8: Content Agent pipeline — weekly topic planning.
 * Generates 2 article plans per product from Core Message + keyword gaps.
 */
export async function planArticles(
  productId: string,
  count: number = 2,
): Promise<ArticlePlan[]> {
  const { rows } = await pool.query<{
    slug: string;
    name: string;
    payload: string;
  }>(
    `SELECT p.slug, p.name, cm.payload::text AS payload
       FROM products p
       JOIN core_messages cm ON cm.product_id = p.id
      WHERE p.id = $1::uuid
      ORDER BY cm.version DESC
      LIMIT 1`,
    [productId],
  );

  if (!rows[0]) {
    log.warn({ productId }, "No Core Message found — cannot plan articles");
    return [];
  }

  const msg: CoreMessagePayload = JSON.parse(rows[0].payload);

  const result = await chatWithUsage(
    [
      {
        role: "system",
        content: `You are the Content Agent for ZECB. Plan ${count} SEO articles for a SaaS product.
Each article must target a specific keyword. Categories: problem_aware (1500-3000 words, pain queries),
solution_aware (800-1500 words, comparison queries), tool_howto (1000-2000 words, transactional queries),
data_research (original analysis, strongest for backlinks).
Return JSON array of objects with: title, slug, category, target_keyword, outline (string[]), word_count_target, internal_links (string[]).
Write in German for DACH market. No generic AI phrases.`,
      },
      {
        role: "user",
        content: `Product: ${rows[0].name} (${rows[0].slug})
Pain: ${msg.pain_statements.pointed}
Promise: ${msg.core_promise.sentence}
Persona: ${msg.target_audience.primary_persona.role} at ${msg.target_audience.primary_persona.company_size} companies
Plan ${count} articles.`,
      },
    ],
    { temperature: 0.6, response_format: { type: "json_object" } },
  );

  try {
    const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const plans: ArticlePlan[] = Array.isArray(parsed) ? parsed : (parsed.articles ?? []);
    return plans.slice(0, count);
  } catch {
    log.error({ productId }, "Failed to parse article plans");
    return [];
  }
}

/**
 * Generate a full article draft from a plan using LLM.
 */
export async function generateArticle(
  productId: string,
  plan: ArticlePlan,
): Promise<string> {
  const { rows } = await pool.query<{ name: string; payload: string }>(
    `SELECT p.name, cm.payload::text AS payload
       FROM products p
       JOIN core_messages cm ON cm.product_id = p.id
      WHERE p.id = $1::uuid
      ORDER BY cm.version DESC LIMIT 1`,
    [productId],
  );
  const msg: CoreMessagePayload | null = rows[0] ? JSON.parse(rows[0].payload) : null;

  const result = await chatWithUsage(
    [
      {
        role: "system",
        content: `You are a German-language SEO content writer for DACH B2B SaaS.
Write a ${plan.word_count_target}-word article in German.
Rules: direct opening (no "In this article..."), real specifics, no "delve"/"navigate the complexities",
include product mentions naturally, use data where possible.
Output the article body in markdown format.`,
      },
      {
        role: "user",
        content: `Title: ${plan.title}
Category: ${plan.category}
Target keyword: ${plan.target_keyword}
Outline: ${plan.outline.join(" → ")}
Product: ${rows[0]?.name ?? ""}
${msg ? `Core promise: ${msg.core_promise.sentence}` : ""}`,
      },
    ],
    { temperature: 0.7, max_tokens: 4000 },
  );

  const { rows: articleRows } = await pool.query<{ id: string }>(
    `INSERT INTO content_articles
       (product_id, title, slug, category, target_keyword, content, word_count, status)
     VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, 'draft')
     RETURNING id::text AS id`,
    [
      productId,
      plan.title,
      plan.slug,
      plan.category,
      plan.target_keyword,
      result.content,
      result.content.split(/\s+/).length,
    ],
  );

  await pool.query(
    `INSERT INTO agent_runs (product_id, agent, task_name, input, output, status, cost_eur, llm_model)
     VALUES ($1::uuid, 'Content Agent', 'generate_article',
             $2::jsonb, $3::jsonb, 'ok', $4, $5)`,
    [
      productId,
      JSON.stringify({ title: plan.title, keyword: plan.target_keyword }),
      JSON.stringify({ article_id: articleRows[0]?.id, word_count: result.content.split(/\s+/).length }),
      result.usage.cost_eur,
      result.usage.model,
    ],
  );

  return result.content;
}
