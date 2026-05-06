import "server-only";

import { pool } from "@/lib/db";
import { log } from "@/lib/log";
import { chatWithUsage } from "@/lib/llm/openrouter";

export type SocialPlatform = "linkedin" | "x";

export type SocialPostDraft = {
  platform: SocialPlatform;
  content: string;
  source_article_id?: string;
  hook_type?: string;
};

/**
 * PRD §8.9: Every SEO blog article → 3 LinkedIn posts + 5 X posts.
 */
export async function generateSocialPostsFromArticle(
  productId: string,
  articleId: string,
): Promise<SocialPostDraft[]> {
  const { rows } = await pool.query<{
    title: string;
    content: string;
    product_name: string;
  }>(
    `SELECT ca.title, ca.content, p.name AS product_name
       FROM content_articles ca
       JOIN products p ON p.id = ca.product_id
      WHERE ca.id = $1::uuid AND ca.product_id = $2::uuid`,
    [articleId, productId],
  );

  if (!rows[0]) {
    log.warn({ articleId, productId }, "Article not found for social generation");
    return [];
  }

  const article = rows[0];
  const contentPreview = article.content?.slice(0, 1500) ?? "";

  const result = await chatWithUsage(
    [
      {
        role: "system",
        content: `You are a social media content creator for a B2B SaaS product in the DACH market.
From a blog article, create:
- 3 LinkedIn posts (hook + body + CTA, professional tone, 150-300 words each)
- 5 X/Twitter posts (one angle each, punchy, 200-280 chars each)

Rules:
- Specific details (numbers, observations) — never generic advice
- No AI-generated imagery descriptions
- Consistent brand voice: direct, warm, competent
- German language for DACH audience

Return JSON: { linkedin: [string, string, string], x: [string, string, string, string, string] }`,
      },
      {
        role: "user",
        content: `Product: ${article.product_name}
Article title: ${article.title}
Article content (preview): ${contentPreview}`,
      },
    ],
    { temperature: 0.7, response_format: { type: "json_object" } },
  );

  try {
    const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const drafts: SocialPostDraft[] = [];

    const linkedinPosts = (parsed.linkedin ?? []) as string[];
    for (const content of linkedinPosts) {
      drafts.push({ platform: "linkedin", content, source_article_id: articleId });
    }

    const xPosts = (parsed.x ?? []) as string[];
    for (const content of xPosts) {
      drafts.push({ platform: "x", content, source_article_id: articleId });
    }

    for (const draft of drafts) {
      await pool.query(
        `INSERT INTO social_posts (product_id, platform, content, source_article_id, status)
         VALUES ($1::uuid, $2, $3, $4::uuid, 'draft')`,
        [productId, draft.platform, draft.content, draft.source_article_id ?? null],
      );
    }

    await pool.query(
      `INSERT INTO agent_runs (product_id, agent, task_name, input, output, status, cost_eur, llm_model)
       VALUES ($1::uuid, 'Social Agent', 'generate_social_posts',
               $2::jsonb, $3::jsonb, 'ok', $4, $5)`,
      [
        productId,
        JSON.stringify({ article_id: articleId, title: article.title }),
        JSON.stringify({ linkedin: linkedinPosts.length, x: xPosts.length }),
        result.usage.cost_eur,
        result.usage.model,
      ],
    );

    return drafts;
  } catch {
    log.error({ productId, articleId }, "Failed to parse social post generation");
    return [];
  }
}

/**
 * PRD §8.10: Message Propagation Loop — top performers for cross-channel testing.
 */
export async function getTopPerformers(
  productId: string,
  limit: number = 5,
): Promise<{
  top_articles: Array<{ id: string; title: string; category: string }>;
  top_social: Array<{ id: string; platform: string; content: string }>;
}> {
  const { rows: articles } = await pool.query<{ id: string; title: string; category: string }>(
    `SELECT id::text AS id, title, category
       FROM content_articles
      WHERE product_id = $1::uuid AND status = 'published'
      ORDER BY seo_score DESC NULLS LAST, created_at DESC
      LIMIT $2`,
    [productId, limit],
  );

  const { rows: social } = await pool.query<{ id: string; platform: string; content: string }>(
    `SELECT id::text AS id, platform, LEFT(content, 200) AS content
       FROM social_posts
      WHERE product_id = $1::uuid AND status = 'published'
      ORDER BY created_at DESC
      LIMIT $2`,
    [productId, limit],
  );

  return { top_articles: articles, top_social: social };
}
