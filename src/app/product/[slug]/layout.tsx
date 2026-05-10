import { redirect } from "next/navigation";

import { readTenantSession } from "@/lib/tenant/session";
import { TenantSidebar } from "@/components/dashboard/TenantSidebar";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 flex">
      <TenantSidebar slug={slug} session={{ name: session.name, email: session.email }} />
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
