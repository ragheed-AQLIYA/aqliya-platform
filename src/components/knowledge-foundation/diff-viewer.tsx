"use client";

import { useDiffViewer } from "./components/use-diff-viewer";
import { VersionSelectors } from "./components/version-selectors";
import { ErrorBanner } from "./components/error-banner";
import { DiffSummary } from "./components/diff-summary";
import { RuleSection } from "./components/rule-section";
import type { Version } from "./components/use-diff-viewer";

export function DiffViewer({ versions }: { versions: Version[] }) {
  const { fromId, setFromId, toId, setToId, diff, loading, error, handleCompare } =
    useDiffViewer();

  return (
    <div className="space-y-6" dir="rtl">
      <VersionSelectors
        fromId={fromId}
        toId={toId}
        onFromIdChange={setFromId}
        onToIdChange={setToId}
        versions={versions}
        loading={loading}
        onCompare={handleCompare}
      />

      <ErrorBanner error={error} />

      {diff && (
        <div className="space-y-4">
          <DiffSummary diff={diff} />
          <RuleSection title="قواعد مضافة" rules={diff.addedRules} variant="added" />
          <RuleSection title="قواعد معدّلة" rules={diff.modifiedRules} variant="modified" />
          <RuleSection title="قواعد محذوفة" rules={diff.removedRules} variant="removed" />
        </div>
      )}
    </div>
  );
}
