"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { useRecommendationsPage } from "./use-recommendations-page";
import { RecommendationsHeader } from "./components/recommendations-header";
import { AiDraftsSection } from "./components/ai-drafts-section";
import { RecommendationsTable } from "./components/recommendations-table";

const TraceabilityDrawer = dynamic(
  () =>
    import("@/components/audit/shared/traceability-drawer").then(
      (m) => ({ default: m.TraceabilityDrawer }),
    ),
  { ssr: false, loading: () => <div className="h-20 animate-pulse rounded-md bg-muted" /> },
);

const CreateRecommendationDialog = dynamic(
  () =>
    import("./components/create-recommendation-dialog").then(
      (m) => ({ default: m.CreateRecommendationDialog }),
    ),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-md bg-muted" /> },
);

export default function RecommendationsPage() {
  const {
    t,
    engagement,
    loading,
    recommendations,
    sorted,
    expandedId,
    traceRec,
    traceabilityOpen,
    traceData,
    showCreate,
    createSubmitting,
    findings,
    newRec,
    createRecError,
    aiDrafts,
    generatingRecDrafts,
    acceptingRecId,
    recHasMore,
    loadingRecMore,
    recTotal,
    onGenerateDrafts,
    onAcceptDraft,
    onRejectDraft,
    onToggleExpand,
    onTraceability,
    onAcceptStatus,
    onRejectStatus,
    onLoadMore,
    onNewRecChange,
    handleCreateRec,
    setShowCreate,
    setTraceabilityOpen,
    setTraceRec,
  } = useRecommendationsPage();

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  if (recommendations.length === 0)
    return (
      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardContent className="p-6 text-muted-foreground">
          {t("noRecommendations")}
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-6" dir="rtl">
      <RecommendationsHeader
        title={t("title")}
        engagement={engagement}
        generatingRecDrafts={generatingRecDrafts}
        t={t}
        onGenerateDrafts={onGenerateDrafts}
        onCreateClick={() => setShowCreate(true)}
      />
      <AiDraftsSection
        aiDrafts={aiDrafts}
        acceptingRecId={acceptingRecId}
        t={t}
        onAccept={onAcceptDraft}
        onReject={onRejectDraft}
      />
      <RecommendationsTable
        sorted={sorted}
        expandedId={expandedId}
        recHasMore={recHasMore}
        loadingRecMore={loadingRecMore}
        recTotal={recTotal}
        recommendationsLength={recommendations.length}
        t={t}
        onToggleExpand={onToggleExpand}
        onTraceability={onTraceability}
        onAcceptStatus={onAcceptStatus}
        onRejectStatus={onRejectStatus}
        onLoadMore={onLoadMore}
      />
      <CreateRecommendationDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        findings={findings}
        newRec={newRec}
        createSubmitting={createSubmitting}
        createRecError={createRecError}
        t={t}
        onNewRecChange={onNewRecChange}
        onCreate={handleCreateRec}
      />
      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => {
          setTraceabilityOpen(false);
          setTraceRec(null);
        }}
        entityType="recommendation"
        entityId={traceRec?.id || ""}
        entityLabel={traceRec?.title || ""}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  );
}
