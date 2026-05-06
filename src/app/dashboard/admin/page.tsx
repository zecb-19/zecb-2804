import { redirect } from "next/navigation";

import { AdminView } from "@/components/dashboard/AdminView";
import { getCurrentUser } from "@/lib/auth/dal";
import { ensureSchema } from "@/lib/db";
import { getSystemStats, listAllUsers } from "@/lib/admin/queries";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  await ensureSchema();

  const [stats, users] = await Promise.all([
    getSystemStats(),
    listAllUsers(),
  ]);

  return <AdminView stats={stats} users={users} />;
}
