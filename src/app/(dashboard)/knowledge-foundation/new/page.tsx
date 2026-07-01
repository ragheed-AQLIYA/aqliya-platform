/**
 * Phase 9 — New Knowledge Foundation Version Page.
 */

import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewVersionForm } from "@/components/knowledge-foundation/new-version-form";
import { getEligibleFoundationCandidates, getFoundationCandidatePoolOverview } from "@/actions/knowledge-foundation/actions";

export const dynamic = "force-dynamic";

export default async function NewVersionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
    redirect("/access-denied");
  }

  const [eligibleCandidates, poolOverview] = await Promise.all([
    getEligibleFoundationCandidates(),
    getFoundationCandidatePoolOverview(),
  ]);

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6" dir="rtl">
      <header>
        <a
          href="/knowledge-foundation"
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← العودة إلى أساس المعرفة
        </a>
        <h1 className="mt-2 text-2xl font-bold">إنشاء إصدار جديد</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          إنشاء إصدار جديد من أساس المعرفة المؤسسية من المرشّحات المعتمدة.
        </p>
      </header>

      <NewVersionForm
        eligibleCandidates={eligibleCandidates}
        poolOverview={poolOverview}
      />
    </div>
  );
}
