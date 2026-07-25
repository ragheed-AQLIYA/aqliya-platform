"use client";

/**
 * Phase 9 — Version Detail Client Component.
 *
 * Displays knowledge foundation version details, diff summary, and
 * governance action buttons.
 */

import { useVersionDetail } from "./components/use-version-detail";
import { VersionStatusMessages } from "./components/version-status-messages";
import { VersionQuickActions } from "./components/version-quick-actions";
import { VersionExportActions } from "./components/version-export-actions";
import { VersionRollbackSection } from "./components/version-rollback-section";
import { VersionDiffsSection } from "./components/version-diffs-section";
import { VersionReleasesSection } from "./components/version-releases-section";

export type VersionDetailStatus = "DRAFT" | "APPROVED" | "RELEASED" | "ACTIVE" | "DEPRECATED";

interface VersionData {
  id: string;
  versionNumber: string;
  status: VersionDetailStatus;
  notes: string | null;
  candidateCount: number;
  artifactPath: string | null;
  createdById: string;
  createdBy?: { id: string; name: string | null; email: string | null } | null;
  approvedById: string | null;
  approvedBy?: { id: string; name: string | null; email: string | null } | null;
  activatedAt: string | null;
  createdAt: string;
  rollbackVersionId: string | null;
  releases?: Array<{
    id: string;
    releaseNotes: string | null;
    createdAt: string;
    createdBy?: { id: string; name: string | null } | null;
  }>;
  diffsAsFrom?: Array<{
    id: string;
    toVersion: { id: string; versionNumber: string };
    riskScore: number;
    breakingChange: boolean;
    summary: string | null;
    generatedAt: string;
  }>;
  diffsAsTo?: Array<{
    id: string;
    fromVersion: { id: string; versionNumber: string };
    riskScore: number;
    breakingChange: boolean;
    summary: string | null;
    generatedAt: string;
  }>;
}

export type { VersionData };

export function VersionDetailClient({
  version,
  userRole,
  versions,
}: {
  version: VersionData;
  userRole: string;
  versions: Array<{ id: string; versionNumber: string; status: string }>;
}) {
  const {
    actionMsg,
    actionError,
    loading,
    exportLoading,
    rollbackId,
    setRollbackId,
    rollbackReason,
    setRollbackReason,
    showRollback,
    setShowRollback,
    isAdmin,
    isOperator,
    isActive,
    targetVersions,
    handleRollback,
    handleApprove,
    handleRelease,
    handleActivate,
    handleDeprecate,
    handleExportStart,
    handleExportError,
    handleExportEnd,
  } = useVersionDetail(version, userRole, versions);

  return (
    <div className="space-y-6" dir="rtl">
      <VersionStatusMessages actionMsg={actionMsg} actionError={actionError} />

      <VersionQuickActions
        version={version}
        loading={loading}
        isAdmin={isAdmin}
        isOperator={isOperator}
        isActive={isActive}
        onApprove={handleApprove}
        onRelease={handleRelease}
        onActivate={handleActivate}
        onDeprecate={handleDeprecate}
      />

      <VersionExportActions
        versionId={version.id}
        exportLoading={exportLoading}
        onExportStart={handleExportStart}
        onExportError={handleExportError}
        onExportEnd={handleExportEnd}
      />

      <VersionRollbackSection
        isAdmin={isAdmin}
        versionStatus={version.status}
        targetVersions={targetVersions}
        loading={loading}
        rollbackId={rollbackId}
        onRollbackIdChange={setRollbackId}
        rollbackReason={rollbackReason}
        onRollbackReasonChange={setRollbackReason}
        showRollback={showRollback}
        onShowRollbackChange={setShowRollback}
        onRollback={handleRollback}
      />

      <VersionDiffsSection diffsAsFrom={version.diffsAsFrom ?? undefined} />

      <VersionReleasesSection releases={version.releases ?? undefined} />
    </div>
  );
}
