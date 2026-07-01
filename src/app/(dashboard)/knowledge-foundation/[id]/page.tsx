/**
 * Phase 9 — Knowledge Foundation Version Detail Page.
 */

import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVersionDetail, listVersions, getBoundFoundationCandidates } from "@/actions/knowledge-foundation/actions";
import { evaluateReleaseReadiness } from "@/lib/knowledge-foundation/release-readiness";
import { verifyReleaseIntegrity } from "@/lib/knowledge-foundation/release-integrity";
import { buildVersionProvenanceManifest } from "@/lib/knowledge-foundation/provenance-manifest";
import { summarizeProvenanceManifest } from "@/lib/knowledge-foundation/provenance-summary";
import { VersionDetailClient } from "@/components/knowledge-foundation/version-detail-client";
import { BoundCandidatesPanel } from "@/components/knowledge-foundation/bound-candidates-panel";
import { ProvenanceSummaryCard } from "@/components/knowledge-foundation/provenance-summary-card";
import { VersionGovernanceSection } from "@/components/knowledge-foundation/version-governance-section";
import { IntegritySection } from "@/components/knowledge-foundation/integrity-section";
import type { VersionDetailStatus } from "@/components/knowledge-foundation/version-detail-client";

export const dynamic = "force-dynamic";

export default async function VersionDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await props.params;
  const version = await getVersionDetail(id);

  if (!version) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-bold">الإصدار غير موجود</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            لم يتم العثور على إصدار بهذا المعرف.
          </p>
          <a
            href="/knowledge-foundation"
            className="mt-4 inline-block text-sm text-primary underline underline-offset-4"
          >
            العودة إلى أساس المعرفة
          </a>
        </div>
      </div>
    );
  }

  const allVersions = await listVersions();
  const boundCandidates = await getBoundFoundationCandidates(id);
  const releasedCount = boundCandidates.filter((c) => c.includedInRelease).length;

  const isOperator = user.role === "ADMIN" || user.role === "OPERATOR";
  const [readiness, provenanceSummary, integrity] = isOperator
    ? await Promise.all([
        evaluateReleaseReadiness(id),
        buildVersionProvenanceManifest(id).then(summarizeProvenanceManifest),
        version.status === "RELEASED"
          ? verifyReleaseIntegrity(id, {
              actorId: user.id,
              versionNumber: version.versionNumber,
              emitAudit: false,
            })
          : Promise.resolve(null),
      ])
    : [null, null, null];

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <header>
        <a
          href="/knowledge-foundation"
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← العودة إلى أساس المعرفة
        </a>
        <h1 className="mt-2 text-2xl font-bold">
          الإصدار v{version.versionNumber}
        </h1>
          <p className="mt-1 text-sm text-muted-foreground">
           أنشئ بواسطة {version.createdByName ?? version.createdById} ·{" "}
           {version.createdAt ? new Date(version.createdAt).toLocaleDateString("ar-SA") : "—"}
         </p>
      </header>

      {/* Metadata cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">الحالة</p>
          <p className="mt-1 text-lg font-bold">{version.status}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">المرشّحات المرتبطة</p>
          <p className="mt-1 text-lg font-bold">{version.candidateCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">مُطلقة في حزم</p>
          <p className="mt-1 text-lg font-bold">{releasedCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">مسار الحزمة</p>
          <p className="mt-1 truncate text-sm font-mono">
            {version.artifactPath ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">المعتمد</p>
          <p className="mt-1 text-sm font-medium">
            {version.approvedBy?.name ?? version.approvedById ?? "—"}
          </p>
        </div>
      </div>

      {/* Notes */}
      {version.notes && (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold">ملاحظات</h3>
          <p className="text-sm text-muted-foreground">{version.notes}</p>
        </section>
      )}

      <BoundCandidatesPanel
        versionId={version.id}
        versionStatus={version.status}
        userRole={user.role}
        candidates={boundCandidates}
      />

      {isOperator && integrity && (
        <IntegritySection versionId={version.id} initialIntegrity={integrity} />
      )}

      {isOperator && readiness && provenanceSummary && (
        <>
          <VersionGovernanceSection
            versionId={version.id}
            initialReadiness={readiness}
          />
          <ProvenanceSummaryCard summary={provenanceSummary} />
        </>
      )}

      {/* Client component with actions */}
      <VersionDetailClient
        version={{
          id: version.id,
          versionNumber: version.versionNumber,
          status: version.status as VersionDetailStatus,
          notes: version.notes,
          candidateCount: version.candidateCount,
          artifactPath: version.artifactPath,
          createdById: version.createdById,
          createdBy: version.createdBy
            ? { id: version.createdBy.id, name: version.createdBy.name, email: version.createdBy.email }
            : null,
          approvedById: version.approvedById,
          approvedBy: version.approvedBy
            ? { id: version.approvedBy.id, name: version.approvedBy.name, email: version.approvedBy.email }
            : null,
            activatedAt: version.activatedAt ? version.activatedAt.toISOString() : null,
          createdAt: version.createdAt,
          rollbackVersionId: version.rollbackVersionId,
           releases: version.releases?.map((r) => ({
             id: r.id,
             releaseNotes: r.releaseNotes,
             createdAt: r.createdAt.toISOString(),
             createdBy: r.createdBy
               ? { id: r.createdBy.id, name: r.createdBy.name }
               : null,
           })),
           diffsAsFrom: version.diffsAsFrom?.map((d) => ({
             id: d.id,
             toVersion: d.toVersion,
             riskScore: d.riskScore,
             breakingChange: d.breakingChange,
             summary: d.summary,
             generatedAt: d.generatedAt?.toISOString() ?? "",
           })),
          diffsAsTo: version.diffsAsTo?.map((d) => ({
            id: d.id,
            fromVersion: d.fromVersion,
            riskScore: d.riskScore,
            breakingChange: d.breakingChange,
            summary: d.summary,
            generatedAt: d.generatedAt?.toISOString() ?? "",
          })),
        }}
        userRole={user.role}
        versions={allVersions.map((v) => ({
          id: v.id,
          versionNumber: v.versionNumber,
          status: v.status,
        }))}
      />
    </div>
  );
}
