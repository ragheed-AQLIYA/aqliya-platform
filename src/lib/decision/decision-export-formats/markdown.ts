import type { ExportData } from "./types";
import {
  fmtDate,
  renderMetadataSection,
  renderRecommendationSection,
  renderApprovedSnapshotSection,
  renderDiffSummarySection,
  renderApprovalHistorySection,
  renderTimelineSection,
  pushSection,
} from "./common";

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

  const md = renderMetadataSection(data);
  pushSection(lines, "Metadata", md);

  const rec = renderRecommendationSection(data);
  if (rec) pushSection(lines, "Current Recommendation", rec);

  const snap = renderApprovedSnapshotSection(data);
  if (snap) pushSection(lines, "Approved Snapshot", snap);

  const diff = renderDiffSummarySection(data);
  if (diff) pushSection(lines, "Diff Summary", diff);

  const hist = renderApprovalHistorySection(data);
  if (hist) pushSection(lines, "Approval History", hist);

  const tl = renderTimelineSection(data);
  if (tl) pushSection(lines, "Timeline", tl);

  return lines.join("\n");
}
