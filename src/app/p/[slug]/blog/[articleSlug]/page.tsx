import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ensureSchema, pool } from "@/lib/db";
import { getMarketingProduct } from "@/lib/marketing/queries";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string; articleSlug: string }>;
}) {
  const { slug, articleSlug } = await params;
  await ensureSchema();
  const product = await getMarketingProduct(slug);
  if (!product) notFound();

  const { rows } = await pool.query<{
    title: string;
    content: string;
    category: string;
    target_keyword: string | null;
    word_count: number;
    published_at: string;
  }>(
    `SELECT title, content, category, target_keyword, word_count, published_at::text
       FROM content_articles
      WHERE product_id = $1::uuid AND slug = $2 AND status = 'published'`,
    [product.id, articleSlug],
  );

  const article = rows[0];
  if (!article) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href={`/p/${slug}/blog`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 mb-8"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
        Alle Artikel
      </Link>

      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
          {article.category}
        </span>
        <span className="text-xs text-slate-400">
          {new Date(article.published_at).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="text-xs text-slate-400">{Math.ceil(article.word_count / 200)} Min. Lesezeit</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">{article.title}</h1>

      <div className="mt-10 prose prose-slate prose-sm max-w-none">
        <ReactMarkdown>{article.content ?? ""}</ReactMarkdown>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-200">
        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <h3 className="font-bold text-slate-900">{product.name} testen</h3>
          <p className="text-sm text-slate-500 mt-1">{product.tagline}</p>
          <Link
            href={`/product/${slug}`}
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Kostenlos starten
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
