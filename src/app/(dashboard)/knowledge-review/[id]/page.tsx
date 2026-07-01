/**
 * Phase 8.1 — Knowledge Candidate Detail Page.
 *
 * Server component that loads candidate, evidence, promotion history
 * and renders a client detail panel with embedded review actions.
 */

import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCandidateDetail, getKPIs } from "@/actions/knowledge-mining-actions";
import { CandidateDetailClient } from "@/components/knowledge-review/candidate-detail";

export const dynamic = "force-dynamic";

type PageParams = Promise<{ id: string }>;

export default async function CandidateDetailPage(props: {
  params: PageParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
    redirect("/access-denied");
  }

  const { id } = await props.params;
  const detail = await getCandidateDetail(id);
  const kpis = await getKPIs();

  if (!detail.candidate) {
    return (
      <div className="flex flex-col items-center gap-4 p-12" dir="rtl">
        <span className="text-4xl">🔍</span>
        <h1 className="text-xl font-bold">المرشّح غير موجود</h1>
        <p className="text-sm text-muted-foreground">
          لم يتم العثور على مرشّح معرفة بالمعرّف &quot;{id}&quot;.
        </p>
        <Link
          href="/knowledge-review"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى لوحة المراجعة
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/knowledge-review" className="hover:text-primary hover:underline">
          مراجعة المعرفة
        </Link>
        <span>/</span>
        <span className="max-w-[200px] truncate font-medium text-foreground">
          {detail.candidate.candidatePhrase}
        </span>
      </nav>

      {/* Client component renders detail + actions */}
      <CandidateDetailClient
        candidate={detail.candidate}
        evidence={detail.evidence}
        promotions={detail.promotions}
        kpis={"error" in kpis ? null : kpis}
      />
    </div>
  );
}
