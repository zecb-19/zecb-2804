import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { pool, ensureSchema } from "@/lib/db";

interface Article {
  id: string;
  product_id: string;
  title: string;
  slug: string;
  category: string;
  target_keyword: string | null;
  content: string | null;
  word_count: number;
  status: string;
  seo_score: number | null;
  published_at: string | null;
  created_at: string;
}

/* ---------- helpers ---------- */

async function getArticle(slug: string): Promise<Article | null> {
  await ensureSchema();
  const { rows } = await pool.query<Article>(
    `SELECT * FROM content_articles WHERE slug = $1 AND status = 'published' LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

async function renderMarkdown(md: string): Promise<React.ReactNode> {
  try {
    const mod = await import("react-markdown");
    const ReactMarkdown = mod.default as React.ComponentType<{
      children: string;
    }>;
    return <ReactMarkdown>{md}</ReactMarkdown>;
  } catch {
    // react-markdown not installed -- fall back to plain text
    return (
      <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
        {md}
      </div>
    );
  }
}

/* ---------- metadata ---------- */

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getArticle(slug);
  if (!article) return { title: "Not Found" };

  const description = (article.content ?? "").slice(0, 160);
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "https://zeroemployee.io";

  return {
    title: `${article.title} | ZECB Blog`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: `${base}/blog/${article.slug}`,
      publishedTime: article.published_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
    },
  };
}

/* ---------- page ---------- */

export default async function ArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const base =
    process.env.NEXT_PUBLIC_APP_URL || "https://zeroemployee.io";
  const articleUrl = `${base}/blog/${article.slug}`;

  const publishedDate = article.published_at
    ? new Date(article.published_at).toISOString()
    : new Date(article.created_at).toISOString();

  const formattedDate = new Date(publishedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /* JSON-LD structured data */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        datePublished: publishedDate,
        dateModified: publishedDate,
        author: {
          "@type": "Organization",
          name: "ZECB",
        },
        publisher: {
          "@type": "Organization",
          name: "ZECB",
        },
        url: articleUrl,
        description: (article.content ?? "").slice(0, 160),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: base,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${base}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };

  const body = article.content
    ? await renderMarkdown(article.content)
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/blog" className="hover:text-slate-900">
          Blog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{article.title}</span>
      </nav>

      <article className="mx-auto max-w-3xl">
        <span className="mb-3 inline-block rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
          {article.category}
        </span>
        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          {article.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-slate-400">
          <time>{formattedDate}</time>
          {article.word_count > 0 && (
            <>
              <span>&middot;</span>
              <span>{Math.ceil(article.word_count / 200)} min read</span>
            </>
          )}
        </div>

        <div className="prose prose-slate mt-8 max-w-none">{body}</div>
      </article>

      <div className="mx-auto mt-12 max-w-3xl border-t border-slate-200 pt-6">
        <Link
          href="/blog"
          className="text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; Back to all articles
        </Link>
      </div>
    </>
  );
}
