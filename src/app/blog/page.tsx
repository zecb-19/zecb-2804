import Link from "next/link";
import type { Metadata } from "next";

import { pool, ensureSchema } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog | ZECB",
  description:
    "Articles on SaaS building, automation, and zero-employee companies.",
};

const PAGE_SIZE = 20;

type SearchParams = Promise<{ page?: string }>;

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string | null;
  published_at: string;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  await ensureSchema();

  const params = (await searchParams) ?? {};
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [articlesResult, countResult] = await Promise.all([
    pool.query<Article>(
      `SELECT id, title, slug, category, content, published_at
       FROM content_articles
       WHERE status = 'published'
       ORDER BY published_at DESC
       LIMIT $1 OFFSET $2`,
      [PAGE_SIZE, offset],
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM content_articles WHERE status = 'published'`,
    ),
  ]);

  const articles = articlesResult.rows;
  const totalCount = parseInt(countResult.rows[0]?.count ?? "0", 10);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (articles.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
        <p className="mt-4 text-slate-500">No articles published yet.</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Blog</h1>
      <p className="mt-2 text-slate-500">
        Insights on SaaS building, automation, and scaling with zero employees.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => {
          const excerpt = (article.content ?? "").slice(0, 200);
          const date = new Date(article.published_at).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "short", day: "numeric" },
          );

          return (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <span className="mb-2 inline-block w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {article.category}
              </span>
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                {article.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                {excerpt}
                {(article.content?.length ?? 0) > 200 ? "..." : ""}
              </p>
              <time className="mt-4 block text-xs text-slate-400">{date}</time>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/blog?page=${currentPage - 1}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100"
            >
              Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/blog?page=${currentPage + 1}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
