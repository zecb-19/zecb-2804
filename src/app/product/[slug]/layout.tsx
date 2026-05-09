import { redirect } from "next/navigation";
import Link from "next/link";

import { readTenantSession } from "@/lib/tenant/session";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 h-16 flex items-center justify-between flex-none sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link
            href={`/product/${slug}/dashboard`}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>monitoring</span>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">{slug}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5">
            <NavLink href={`/product/${slug}/dashboard`} label="Dashboard" icon="space_dashboard" />
            <NavLink href={`/product/${slug}/rules`} label="Rules" icon="tune" />
            <NavLink href={`/product/${slug}/timeline`} label="Timeline" icon="timeline" />
            <NavLink href={`/product/${slug}/alerts`} label="Alerts" icon="notifications_active" />
            <NavLink href={`/product/${slug}/settings`} label="Settings" icon="settings" />
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold">
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
              className="px-3 py-1.5 rounded-lg text-slate-500 text-sm font-medium hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center gap-1 px-4 py-2 bg-white border-b border-slate-100 overflow-x-auto">
        <NavLink href={`/product/${slug}/dashboard`} label="Dashboard" icon="space_dashboard" />
        <NavLink href={`/product/${slug}/rules`} label="Rules" icon="tune" />
        <NavLink href={`/product/${slug}/timeline`} label="Timeline" icon="timeline" />
        <NavLink href={`/product/${slug}/alerts`} label="Alerts" icon="notifications_active" />
        <NavLink href={`/product/${slug}/settings`} label="Settings" icon="settings" />
      </nav>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors whitespace-nowrap"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </Link>
  );
}
