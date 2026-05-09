import { redirect } from "next/navigation";
import Link from "next/link";

import { readTenantSession } from "@/lib/tenant/session";
import { DesktopNav, MobileNav } from "@/components/product/NavLinks";

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();

  const isAuthPage = !session || session.productSlug !== slug;

  if (isAuthPage) {
    return <>{children}</>;
  }

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 md:px-6 h-16 flex items-center justify-between flex-none sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link href={`/product/${slug}/dashboard`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>monitoring</span>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">{slug}</span>
          </Link>
          <DesktopNav slug={slug} />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {initials}
            </div>
            <span className="text-sm text-slate-600">{session.email}</span>
          </div>
          <form action={async () => {
            "use server";
            const { deleteTenantSession } = await import("@/lib/tenant/session");
            const { redirect: nav } = await import("next/navigation");
            await deleteTenantSession();
            nav(`/product/${slug}`);
          }}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl text-slate-400 text-sm font-medium hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <MobileNav slug={slug} />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
