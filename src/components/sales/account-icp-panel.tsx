"use client";

import { useAccountIcpPanel } from "./components/use-account-icp-panel";
import { IcpPanelUnconfigured } from "./components/icp-panel-unconfigured";
import { IcpPanelScoreSection } from "./components/icp-panel-score-section";
import { IcpPanelActions } from "./components/icp-panel-actions";
import { IcpPanelErrorBanner } from "./components/icp-panel-error-banner";

export function AccountIcpPanel({
  accountId,
  metadata,
  canUpdate = false,
}: {
  accountId: string;
  metadata: unknown;
  canUpdate?: boolean;
}) {
  const { assessment, loading, reviewLoading, error, handleRecalculate, handleReviewToggle } =
    useAccountIcpPanel(accountId, metadata, canUpdate);

  if (!assessment.configured || !assessment.score) {
    return (
      <IcpPanelUnconfigured
        canUpdate={canUpdate}
        loading={loading}
        error={error}
        onRecalculate={handleRecalculate}
      />
    );
  }

  const { score } = assessment;

  return (
    <div className="space-y-4">
      <IcpPanelScoreSection score={score} />

      {canUpdate ? (
        <IcpPanelActions
          accountId={accountId}
          loading={loading}
          reviewLoading={reviewLoading}
          reviewed={score.reviewed === true}
          agentGenerated={!!score.agentGenerated}
          onRecalculate={handleRecalculate}
          onReviewToggle={handleReviewToggle}
        />
      ) : null}

      {error ? <IcpPanelErrorBanner error={error} /> : null}
    </div>
  );
}
