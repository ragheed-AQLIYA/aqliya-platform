import type { ExportData } from "./types";

export function boolYesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

export function orFallback(value: string | null | undefined, fallback = "N/A"): string {
  return value ?? fallback;
}

export function fmtPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function fmtScore(value: number): string {
  return value.toFixed(1);
}

export function fmtDate(value: Date | null | undefined): string {
  return value ? value.toISOString() : "Unknown";
}

export function mdTableRow(cells: string[]): string {
  return `| ${cells.join(" | ")} |`;
}

export function mdTableHeader(cells: string[]): string {
  return mdTableRow(cells);
}

export function mdTableSeparator(colCount: number): string {
  return `|${Array.from({ length: colCount }, () => "------").join("|")}|`;
}

export function pushSection(lines: string[], title: string, body: string[]): void {
  lines.push(`## ${title}`);
  lines.push("");
  lines.push(...body);
  lines.push("");
}

export function pushSubSection(lines: string[], title: string, body: string[]): void {
  lines.push(`### ${title}`);
  lines.push("");
  lines.push(...body);
  lines.push("");
}

export function pushKeyValue(lines: string[], key: string, value: string): void {
  lines.push(`**${key}:** ${value}`);
}

export function pushKvTable(
  lines: string[],
  rows: [string, string][],
  headerLabel = "Field",
  valueLabel = "Value",
): void {
  lines.push(mdTableHeader([headerLabel, valueLabel]));
  lines.push(mdTableSeparator(2));
  for (const [k, v] of rows) {
    lines.push(mdTableRow([k, v]));
  }
}

export function renderMetadataSection(data: ExportData): string[] {
  const rows: [string, string][] = [
    ["ID", data.metadata.id],
    ["Title", data.metadata.title],
    ["Type", data.metadata.type],
    ["Status", data.metadata.status],
    ["Priority", orFallback(data.metadata.priority)],
    ["Owner", orFallback(data.metadata.owner, "Unassigned")],
    ["Organization", orFallback(data.metadata.organization)],
    ["Created", data.metadata.createdAt.toISOString()],
    ["Updated", data.metadata.updatedAt.toISOString()],
  ];
  if (data.metadata.targetDate) {
    rows.push(["Target Date", data.metadata.targetDate.toISOString()]);
  }
  if (data.metadata.description) {
    rows.push(["Description", data.metadata.description]);
  }
  const lines: string[] = [];
  pushKvTable(lines, rows);
  return lines;
}

export function renderRecommendationSection(data: ExportData): string[] | null {
  if (!data.recommendation) return null;
  const r = data.recommendation;
  const lines: string[] = [];
  pushKeyValue(lines, "Version", String(r.publishedVersion));
  pushKeyValue(lines, "Published", fmtDate(r.publishedAt));
  pushKeyValue(lines, "Visible", boolYesNo(r.isClientVisible));
  pushKeyValue(lines, "From Snapshot", boolYesNo(r.publishedFromSnapshot));
  pushKeyValue(lines, "Human Review Required", boolYesNo(r.humanReviewRequired));
  lines.push("");
  pushSubSection(lines, "Recommended Action", [r.recommendedAction]);
  pushSubSection(lines, "Rationale", [r.rationale]);
  pushSubSection(lines, "Expected Next State", [r.expectedNextState]);
  if (r.scopeExclusions) pushSubSection(lines, "Scope Exclusions", [r.scopeExclusions]);
  if (r.assumptionsUsed) pushSubSection(lines, "Assumptions Used", [r.assumptionsUsed]);
  if (r.risksAccepted) pushSubSection(lines, "Risks Accepted", [r.risksAccepted]);
  if (r.risksRejected) pushSubSection(lines, "Risks Rejected", [r.risksRejected]);
  return lines;
}

export function renderApprovedSnapshotSection(data: ExportData): string[] | null {
  if (!data.approvedSnapshot) return null;
  const s = data.approvedSnapshot;
  const lines: string[] = [];
  pushKeyValue(lines, "Source", s.isImmutable ? "Immutable" : "Legacy (Not Frozen)");
  pushKeyValue(lines, "Approved By", orFallback(s.approver, "Unknown"));
  pushKeyValue(lines, "Approved At", fmtDate(s.approvedAt));
  lines.push("");
  pushSubSection(lines, "Action", [s.action || "N/A"]);
  pushSubSection(lines, "Rationale", [s.rationale || "N/A"]);
  if (s.conditions) pushSubSection(lines, "Conditions", [s.conditions]);
  if (s.overrideReason) pushSubSection(lines, "Override Reason", [s.overrideReason]);
  if (s.confidence != null) {
    lines.push("");
    pushKeyValue(lines, "Confidence", fmtPct(s.confidence));
  }
  if (s.score != null) {
    lines.push("");
    pushKeyValue(lines, "Score", fmtScore(s.score));
  }
  return lines;
}

export function renderDiffSummarySection(data: ExportData): string[] | null {
  if (!data.diffSummary) return null;
  return [data.diffSummary];
}

export function renderApprovalHistorySection(data: ExportData): string[] | null {
  if (data.approvalHistory.length === 0) return null;
  const lines: string[] = [];
  lines.push(mdTableHeader(["Date", "Approver", "Status", "Comments"]));
  lines.push(mdTableSeparator(4));
  for (const a of data.approvalHistory) {
    lines.push(mdTableRow([
      a.createdAt.toISOString(),
      orFallback(a.approver, "Unknown"),
      a.status,
      a.comments || "-",
    ]));
  }
  return lines;
}

export function renderTimelineSection(data: ExportData): string[] | null {
  if (data.timeline.length === 0) return null;
  const lines: string[] = [];
  lines.push(mdTableHeader(["Date", "Event", "Actor", "Details"]));
  lines.push(mdTableSeparator(4));
  for (const e of data.timeline) {
    lines.push(mdTableRow([
      e.date.toISOString(),
      `${e.label}${e.isCritical ? " 🔴" : ""}`,
      e.actor || "-",
      e.details || "-",
    ]));
  }
  return lines;
}
