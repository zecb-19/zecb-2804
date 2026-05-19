import type { MetadataRoute } from "next";

import { pool, ensureSchema } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://zeroemployee.io";

  await ensureSchema();

  const [articlesResult, productsResult] = await Promise.all([
    pool.query<{ slug: string; published_at: string }>(
      `SELECT slug, published_at FROM content_articles WHERE status = 'published' ORDER BY published_at DESC`,
    ),
    pool.query<{ slug: string; updated_at: string }>(
      `SELECT slug, updated_at FROM products WHERE status = 'live' ORDER BY updated_at DESC`,
    ),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/legal/impressum`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/legal/datenschutz`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/legal/agb`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const articleEntries: MetadataRoute.Sitemap = articlesResult.rows.map(
    (article) => ({
      url: `${base}/blog/${article.slug}`,
      lastModified: new Date(article.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }),
  );

  const productEntries: MetadataRoute.Sitemap = productsResult.rows.map(
    (product) => ({
      url: `${base}/product/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  return [...staticEntries, ...articleEntries, ...productEntries];
}
