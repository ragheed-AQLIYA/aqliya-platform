import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  listPendingFalsePositives,
  listPendingPatternSuggestions,
  getIndustryPatternBenchmarks,
  getOrganizationMatchMemory,
} from "@/lib/local-content/workbook/ai-advisor";
import { AiAdvisorOverview } from "@/components/local-content/ai-advisor/ai-advisor-overview";
import {
  reviewFpFlagAction,
  reviewPatternSuggestionAction,
} from "@/actions/localcontent-ai-advisor-actions";

export const dynamic = "force-dynamic";

export default async function AiAdvisorPage() {
  noStore();

  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  const organizationId = user.organizationId;

  // Load all advisor data in parallel
  const [fpResult, suggestionsResult, benchmarksResult, orgMemResult] = await Promise.all([
    listPendingFalsePositives(organizationId),
    listPendingPatternSuggestions(organizationId),
    getIndustryPatternBenchmarks(),
    getOrganizationMatchMemory(organizationId),
  ]);

  const pendingFlags = fpResult.success && fpResult.data ? fpResult.data : [];
  const pendingSuggestions = suggestionsResult.success && suggestionsResult.data ? suggestionsResult.data : [];
  const industryBenchmarks = benchmarksResult.success && benchmarksResult.data ? benchmarksResult.data : [];
  const orgMemory = orgMemResult.success && orgMemResult.data ? orgMemResult.data : [];

  return (
    <div className="min-h-screen p-6">
      <AiAdvisorOverview
        pendingFlags={pendingFlags}
        pendingSuggestions={pendingSuggestions}
        industryBenchmarks={industryBenchmarks}
        orgMemory={orgMemory}
        onReviewFlag={reviewFpFlagAction}
        onReviewSuggestion={reviewPatternSuggestionAction}
      />
    </div>
  );
}
