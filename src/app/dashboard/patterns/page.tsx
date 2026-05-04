import { redirect } from "next/navigation";

import { PatternLibraryView } from "@/components/dashboard/PatternLibraryView";
import { getCurrentUser } from "@/lib/auth/dal";
import { ensureSchema } from "@/lib/db";
import {
  listPatterns,
  listPatternCategories,
  listPatternCandidates,
  getPatternStats,
} from "@/lib/patterns/queries";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  await ensureSchema();

  const [patterns, categories, candidates, stats] = await Promise.all([
    listPatterns(),
    listPatternCategories(),
    listPatternCandidates(user.id),
    getPatternStats(),
  ]);

  return (
    <PatternLibraryView
      patterns={patterns}
      categories={categories}
      candidates={candidates}
      stats={stats}
    />
  );
}
