"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { DecisionTabs } from "@/components/decisions/decision-tabs";
import { useRecommendationPage } from "./components/use-recommendation-page";
import { RecommendationGateBlocked } from "./components/recommendation-gate-blocked";
import { RecommendationHeader } from "./components/recommendation-header";
import { RecommendationAdminActions } from "./components/recommendation-admin-actions";
import { RecommendationDiffSection } from "./components/recommendation-diff-section";
import { RecommendationForm } from "./components/recommendation-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function RecommendationPage({ params }: PageProps) {
  const { id } = use(params);
  const { state, actions } = useRecommendationPage(params);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!state.gate.allowed) {
    return <RecommendationGateBlocked decisionId={id} missing={state.gate.missing} />;
  }

  return (
    <div className="space-y-6">
      <DecisionTabs decisionId={id} decisionType={state.decisionType || undefined} />
      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardHeader>
          <RecommendationHeader
            decisionType={state.decisionType}
            isClientVisible={state.publication.isClientVisible}
            publishedVersion={state.publication.publishedVersion}
          />
        </CardHeader>
        <CardContent>
          {state.currentUserRole === "ADMIN" && state.hasRecommendation && (
            <RecommendationAdminActions
              isVisible={state.publication.isClientVisible}
              saving={state.saving}
              onPublish={actions.handlePublish}
              onUnpublish={actions.handleUnpublish}
            />
          )}

          {state.snapshotWarning && (
            <RecommendationDiffSection
              snapshotWarning={state.snapshotWarning}
              diffData={state.diffData}
              showDiff={state.showDiff}
              loadingDiff={state.loadingDiff}
              showPublishConfirm={state.showPublishConfirm}
              saving={state.saving}
              onToggleDiff={() => actions.setShowDiff(!state.showDiff)}
              onLoadDiff={actions.loadDiff}
              onPublish={actions.handlePublish}
              onCancelOverride={() => actions.setShowPublishConfirm(false)}
            />
          )}

          <RecommendationForm
            formData={state.formData}
            error={state.error}
            saving={state.saving}
            onFieldChange={actions.updateFormField}
            onToggleHumanReview={actions.toggleHumanReview}
            onSubmit={actions.handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
