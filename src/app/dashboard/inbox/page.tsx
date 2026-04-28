import { getCurrentUser } from "@/lib/auth/dal";
import {
  countIdeasByStatus,
  listIdeasForUser,
} from "@/lib/ideas/queries";
import { IdeaInboxView } from "@/components/dashboard/IdeaInboxView";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [ideas, counts] = await Promise.all([
    listIdeasForUser(user.id),
    countIdeasByStatus(user.id),
  ]);
  return <IdeaInboxView ideas={ideas} counts={counts} />;
}
