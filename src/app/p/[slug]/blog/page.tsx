import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureSchema, pool } from "@/lib/db";
import { getMarketingProduct } from "@/lib/marketing/queries";

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureSchema();
  const product = await getMarketingProduct(slug);
  if (!product) notFound();

  const { rows: articles } = await pool.query<{
    id: string;
    slug: string;
    title: string;
    category: string;
    target_keyword: string | null;
    word_count: number;
    published_at: string;
  }>(
    `SELECT id::text, slug, title, category, target_keyword, word_count, published_at::text
       FROM content_articles
      WHERE product_id = $1::uuid AND status = 'published'
      ORDER BY published_at DESC
      LIMIT 50`,
    [product.id],
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-black text-slate-900">Blog</h1>
        <p className="text-slate-500 mt-2">Tipps, Anleitungen und Neuigkeiten rund um {product.name}.</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 32 }}>article</span>
          </div>
          <h2 className="text-lg font-bold text-slate-700 mt-4">Noch keine Artikel</h2>
          <p className="text-sm text-slate-500 mt-1">Demnächst erscheinen hier Tipps und Anleitungen.</p>
          <Link href={`/p/${slug}`} className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Zurück zur Startseite
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/p/${slug}/blog/${article.slug}`}
              className="block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                  {article.category}
                </span>
                {article.target_keyword && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                    {article.target_keyword}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 hover:text-blue-700 transition-colors">
                {article.title}
              </h2>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                <span>{new Date(article.published_at).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}</span>
                <span>{article.word_count} Wörter</span>
                <span>{Math.ceil(article.word_count / 200)} Min. Lesezeit</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
