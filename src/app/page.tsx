import { getCurrentUser } from "@/lib/auth/dal";
import { Landing } from "@/components/landing/Landing";

export default async function Home() {
  const user = await getCurrentUser();
  const navUser = user ? { email: user.email, name: user.name } : null;
  return <Landing user={navUser} />;
}
