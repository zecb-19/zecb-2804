import { redirect } from "next/navigation";

import { Landing } from "@/components/landing/Landing";
import { getCurrentUser } from "@/lib/auth/dal";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }
  return <Landing user={null} />;
}
