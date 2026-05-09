import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth/dal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  return (
    <DashboardShell user={{ name: user.name, email: user.email }}>
      {children}
    </DashboardShell>
  );
}
