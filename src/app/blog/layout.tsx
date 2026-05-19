import Link from "next/link";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            &larr; Back to ZECB
          </Link>
          <Link href="/blog" className="text-lg font-bold text-slate-900">
            ZECB Blog
          </Link>
          {/* Spacer to keep the title visually centered */}
          <span className="w-24" />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
