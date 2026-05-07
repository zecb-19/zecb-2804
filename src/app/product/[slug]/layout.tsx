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

  const isAuthPage =
    !session || session.productSlug !== slug;

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-white border-b border-surface-variant px-4 md:px-6 h-14 flex items-center justify-between flex-none">
        <div className="flex items-center gap-4">
          <Link
            href={`/product/${slug}/dashboard`}
            className="font-bold text-primary text-body-lg"
          >
            {slug}
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink href={`/product/${slug}/dashboard`} label="Dashboard" icon="dashboard" />
            <NavLink href={`/product/${slug}/rules`} label="Rules" icon="rule" />
            <NavLink href={`/product/${slug}/timeline`} label="Timeline" icon="timeline" />
            <NavLink href={`/product/${slug}/alerts`} label="Alerts" icon="notifications" />
            <NavLink href={`/product/${slug}/settings`} label="Settings" icon="settings" />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-label-sm text-on-surface-variant hidden sm:inline">
            {session.email}
          </span>
          <form action={async () => {
            "use server";
            const { deleteTenantSession } = await import("@/lib/tenant/session");
            const { redirect: nav } = await import("next/navigation");
            await deleteTenantSession();
            nav(`/product/${slug}`);
          }}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-on-surface-variant text-label-sm hover:bg-surface-container-low"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant text-body-md hover:bg-surface-container-low hover:text-primary transition-colors"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </Link>
  );
}
