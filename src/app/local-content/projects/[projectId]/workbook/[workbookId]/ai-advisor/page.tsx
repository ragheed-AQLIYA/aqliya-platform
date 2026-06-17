import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWorkbookWithLines } from "@/lib/local-content/workbook/population";
import {
  listPendingFalsePositives,
  listPendingPatternSuggestions,
  getOrganizationMatchMemory,
  getIndustryPatternBenchmarks,
} from "@/lib/local-content/workbook/ai-advisor";
import { WorkbookAiAdvisorClient } from "./workbook-ai-advisor-client";

export const dynamic = "force-dynamic";

export default async function WorkbookAiAdvisorPage({
  params,
}: {
  params: Promise<{ projectId: string; workbookId: string }>;
}) {
  noStore();

  const { projectId, workbookId } = await params;

  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  const workbook = await getWorkbookWithLines(workbookId);
  if (!workbook) {
    notFound();
  }

  const organizationId = user.organizationId;

  const [fpResult, suggestionsResult, orgMemResult, benchmarksResult] = await Promise.all([
    listPendingFalsePositives(organizationId),
    listPendingPatternSuggestions(organizationId),
    getOrganizationMatchMemory(organizationId),
    getIndustryPatternBenchmarks(),
  ]);

  return (
    <div className="min-h-screen p-6">
      <WorkbookAiAdvisorClient
        projectId={projectId}
        workbookId={workbookId}
        workbook={workbook}
        pendingFlags={fpResult.success && fpResult.data ? fpResult.data.filter(
          (f: { workbookLineCode: string }) =>
            workbook.lines.some((l) => l.code === f.workbookLineCode),
        ) : []}
        pendingSuggestions={suggestionsResult.success && suggestionsResult.data ? suggestionsResult.data : []}
        orgMemory={orgMemResult.success && orgMemResult.data ? orgMemResult.data : []}
        industryBenchmarks={benchmarksResult.success && benchmarksResult.data ? benchmarksResult.data : []}
      />
    </div>
  );
}
