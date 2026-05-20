import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureSchema } from "@/lib/db";
import { getMarketingProduct } from "@/lib/marketing/queries";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await ensureSchema();
  const product = await getMarketingProduct(slug);
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/p/${slug}`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>monitoring</span>
            </div>
            <span className="font-bold text-slate-900 text-[15px]">{product.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Preise</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href={`/product/${slug}`} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
              Anmelden
            </Link>
            <Link
              href={`/product/${slug}`}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Kostenlos testen
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>monitoring</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">{product.name}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{product.tagline}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Produkt</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <a href="#features" className="block hover:text-slate-700">Features</a>
                <a href="#pricing" className="block hover:text-slate-700">Preise</a>
                <Link href={`/product/${slug}`} className="block hover:text-slate-700">Anmelden</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Rechtliches</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <Link href={`/p/${slug}/impressum`} className="block hover:text-slate-700">Impressum</Link>
                <Link href={`/p/${slug}/datenschutz`} className="block hover:text-slate-700">Datenschutz</Link>
                <Link href={`/p/${slug}/agb`} className="block hover:text-slate-700">AGB</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Kontakt</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <a href="#faq" className="block hover:text-slate-700">FAQ</a>
                <p className="text-xs text-slate-400 mt-4">Powered by ZECB</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-400 text-center">
            © {new Date().getFullYear()} {product.name}. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
