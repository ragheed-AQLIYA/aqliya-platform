type ExportData = {
  metadata: {
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string | null;
    description: string | null;
    targetDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    owner: string | null;
    organization: string | null;
  };
  recommendation: {
    id: string;
    recommendedAction: string;
    rationale: string;
    expectedNextState: string;
    scopeExclusions: string;
    assumptionsUsed: string;
    risksAccepted: string;
    risksRejected: string;
    publishedVersion: number;
    publishedAt: Date | null;
    isClientVisible: boolean;
    publishedFromSnapshot: boolean;
    humanReviewRequired: boolean;
    updatedAt: Date;
  } | null;
  approvedSnapshot: {
    action: string | null;
    rationale: string | null;
    expectedNextState: string | null;
    scopeExclusions: string | null;
    assumptionsUsed: string | null;
    risksAccepted: string | null;
    risksRejected: string | null;
    conditions: string | null;
    confidence: number | null;
    score: number | null;
    overrideReason: string | null;
    approvedAt: Date | null;
    approver: string | null;
    isImmutable: boolean;
  } | null;
  approvalHistory: {
    status: string;
    approver: string | null;
    comments: string | null;
    conditions: string | null;
    createdAt: Date;
    recommendationId: string | null;
  }[];
  diffSummary: string | null;
  timeline: {
    type: string;
    label: string;
    date: Date;
    actor: string | null;
    details: string | null;
    isCritical: boolean;
    category: string;
  }[];
  exportMetadata: {
    exportedAt: Date;
    exportedBy: string;
    requestedFormat: "json" | "markdown";
    snapshotSource: string;
    evidenceCount: number;
    warnings: string[];
  };
};

export function formatExportJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

export function formatExportMarkdown(data: ExportData): string {
  const lines: string[] = [];

  lines.push(`# Decision Export: ${data.metadata.title}`);
  lines.push("");
  lines.push(`**Exported:** ${data.exportMetadata.exportedAt.toISOString()}`);
  lines.push(`**Exported By:** ${data.exportMetadata.exportedBy}`);
  lines.push(`**Requested Format:** ${data.exportMetadata.requestedFormat}`);
  lines.push(`**Snapshot Source:** ${data.exportMetadata.snapshotSource}`);
  lines.push(`**Evidence Count:** ${data.exportMetadata.evidenceCount}`);
  lines.push("");

  if (data.exportMetadata.warnings.length > 0) {
    lines.push("## Warnings");
    lines.push("");
    for (const w of data.exportMetadata.warnings) {
      lines.push(`- ⚠️ ${w}`);
    }
    lines.push("");
  }

  lines.push("## Metadata");
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| ID | ${data.metadata.id} |`);
  lines.push(`| Title | ${data.metadata.title} |`);
  lines.push(`| Type | ${data.metadata.type} |`);
  lines.push(`| Status | ${data.metadata.status} |`);
  lines.push(`| Priority | ${data.metadata.priority || "N/A"} |`);
  lines.push(`| Owner | ${data.metadata.owner || "Unassigned"} |`);
  lines.push(`| Organization | ${data.metadata.organization || "N/A"} |`);
  lines.push(`| Created | ${data.metadata.createdAt.toISOString()} |`);
  lines.push(`| Updated | ${data.metadata.updatedAt.toISOString()} |`);
  if (data.metadata.targetDate) {
    lines.push(`| Target Date | ${data.metadata.targetDate.toISOString()} |`);
  }
  if (data.metadata.description) {
    lines.push(`| Description | ${data.metadata.description} |`);
  }
  lines.push("");

  if (data.recommendation) {
    lines.push("## Current Recommendation");
    lines.push("");
    lines.push(`**Version:** ${data.recommendation.publishedVersion}`);
    lines.push(
      `**Published:** ${data.recommendation.publishedAt ? data.recommendation.publishedAt.toISOString() : "Not published"}`,
    );
    lines.push(
      `**Visible:** ${data.recommendation.isClientVisible ? "Yes" : "No"}`,
    );
    lines.push(
      `**From Snapshot:** ${data.recommendation.publishedFromSnapshot ? "Yes" : "No"}`,
    );
    lines.push(
      `**Human Review Required:** ${data.recommendation.humanReviewRequired ? "Yes" : "No"}`,
    );
    lines.push("");
    lines.push("### Recommended Action");
    lines.push("");
    lines.push(data.recommendation.recommendedAction);
    lines.push("");
    lines.push("### Rationale");
    lines.push("");
    lines.push(data.recommendation.rationale);
    lines.push("");
    lines.push("### Expected Next State");
    lines.push("");
    lines.push(data.recommendation.expectedNextState);
    lines.push("");
    if (data.recommendation.scopeExclusions) {
      lines.push("### Scope Exclusions");
      lines.push("");
      lines.push(data.recommendation.scopeExclusions);
      lines.push("");
    }
    if (data.recommendation.assumptionsUsed) {
      lines.push("### Assumptions Used");
      lines.push("");
      lines.push(data.recommendation.assumptionsUsed);
      lines.push("");
    }
    if (data.recommendation.risksAccepted) {
      lines.push("### Risks Accepted");
      lines.push("");
      lines.push(data.recommendation.risksAccepted);
      lines.push("");
    }
    if (data.recommendation.risksRejected) {
      lines.push("### Risks Rejected");
      lines.push("");
      lines.push(data.recommendation.risksRejected);
      lines.push("");
    }
  }

  if (data.approvedSnapshot) {
    lines.push("## Approved Snapshot");
    lines.push("");
    lines.push(
      `**Source:** ${data.approvedSnapshot.isImmutable ? "Immutable" : "Legacy (Not Frozen)"}`,
    );
    lines.push(
      `**Approved By:** ${data.approvedSnapshot.approver || "Unknown"}`,
    );
    lines.push(
      `**Approved At:** ${data.approvedSnapshot.approvedAt ? data.approvedSnapshot.approvedAt.toISOString() : "Unknown"}`,
    );
    lines.push("");
    lines.push("### Action");
    lines.push("");
    lines.push(data.approvedSnapshot.action || "N/A");
    lines.push("");
    lines.push("### Rationale");
    lines.push("");
    lines.push(data.approvedSnapshot.rationale || "N/A");
    lines.push("");
    if (data.approvedSnapshot.conditions) {
      lines.push("### Conditions");
      lines.push("");
      lines.push(data.approvedSnapshot.conditions);
      lines.push("");
    }
    if (data.approvedSnapshot.overrideReason) {
      lines.push("### Override Reason");
      lines.push("");
      lines.push(data.approvedSnapshot.overrideReason);
      lines.push("");
    }
    if (data.approvedSnapshot.confidence != null) {
      lines.push(
        `**Confidence:** ${Math.round(data.approvedSnapshot.confidence * 100)}%`,
      );
      lines.push("");
    }
    if (data.approvedSnapshot.score != null) {
      lines.push(`**Score:** ${data.approvedSnapshot.score.toFixed(1)}`);
      lines.push("");
    }
  }

  if (data.diffSummary) {
    lines.push("## Diff Summary");
    lines.push("");
    lines.push(data.diffSummary);
    lines.push("");
  }

  if (data.approvalHistory.length > 0) {
    lines.push("## Approval History");
    lines.push("");
    lines.push("| Date | Approver | Status | Comments |");
    lines.push("|------|----------|--------|----------|");
    for (const a of data.approvalHistory) {
      lines.push(
        `| ${a.createdAt.toISOString()} | ${a.approver || "Unknown"} | ${a.status} | ${a.comments || "-"} |`,
      );
    }
    lines.push("");
  }

  if (data.timeline.length > 0) {
    lines.push("## Timeline");
    lines.push("");
    lines.push("| Date | Event | Actor | Details |");
    lines.push("|------|-------|-------|---------|");
    for (const e of data.timeline) {
      lines.push(
        `| ${e.date.toISOString()} | ${e.label}${e.isCritical ? " 🔴" : ""} | ${e.actor || "-"} | ${e.details || "-"} |`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
