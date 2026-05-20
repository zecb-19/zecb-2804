import { redirect } from "next/navigation";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema, pool } from "@/lib/db";
import { TenantSidebar } from "@/components/dashboard/TenantSidebar";
import { TenantTopbar } from "@/components/dashboard/TenantTopbar";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

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
    return <>{children}<CookieConsent /></>;
  }

  await ensureSchema();

  const [productRow, healthRows] = await Promise.all([
    pool.query<{ name: string }>(
      "SELECT name FROM products WHERE id = $1::uuid",
      [session.productId],
    ),
    pool.query<{ name: string; last_fetch_status: string | null }>(
      "SELECT name, last_fetch_status FROM data_sources WHERE product_id = $1::uuid AND enabled = TRUE ORDER BY name",
      [session.productId],
    ),
  ]);

  const productName = productRow.rows[0]?.name ?? slug;
  const sourceHealth = healthRows.rows.map((r) => ({ name: r.name, status: r.last_fetch_status }));
  const healthySources = sourceHealth.filter((s) => s.status === "ok").length;
  const totalSources = sourceHealth.length;
  const healthStatus = totalSources === 0 ? "unknown" as const : healthySources === totalSources ? "healthy" as const : "degraded" as const;

  return (
    <ThemeProvider>
    <div className="min-h-screen bg-[var(--tenant-bg,#f8f9fb)] flex">
      <TenantSidebar
        slug={slug}
        productName={productName}
        session={{ name: session.name, email: session.email }}
        sourceHealth={sourceHealth}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <TenantTopbar slug={slug} healthStatus={healthStatus} sourcesCount={totalSources} />
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <CookieConsent />
    </div>
    </ThemeProvider>
  );
}
