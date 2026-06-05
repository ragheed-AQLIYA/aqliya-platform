// ─── SIEM Event Formatters ───

import type { PlatformAuditLog } from "@prisma/client";

export interface FormattedSiemEvent {
  format: string;
  body: string;
  contentType: string;
}

/**
 * Format audit log events as a standard JSON array.
 */
export function formatAsJson(events: PlatformAuditLog[]): FormattedSiemEvent {
  const body = JSON.stringify(
    events.map((e) => ({
      id: e.id,
      timestamp: e.createdAt.toISOString(),
      productKey: e.productKey,
      action: e.action,
      actor: {
        id: e.actorId,
        type: e.actorType,
        email: e.actorEmail,
        name: e.actorName,
      },
      target: {
        type: e.targetType,
        id: e.targetId,
        label: e.targetLabel,
      },
      context: {
        platformOrganizationId: e.platformOrganizationId,
        clientWorkspaceId: e.clientWorkspaceId,
        projectId: e.projectId,
        environment: e.environment,
      },
      severity: e.severity,
      status: e.status,
      source: {
        system: e.sourceSystem,
        model: e.sourceModel,
        id: e.sourceId,
        ip: e.ipAddress,
        userAgent: e.userAgent,
      },
      ai: e.aiProvider
        ? {
            provider: e.aiProvider,
            model: e.aiModel,
            promptVersion: e.aiPromptVersion,
            outputReviewStatus: e.aiOutputReviewStatus,
          }
        : undefined,
      evidenceRefs: e.evidenceRefs,
      metadata: e.metadata,
    })),
    null,
    2,
  );
  return { format: "json", body, contentType: "application/json" };
}

/**
 * Format audit log events as RFC 5424 syslog messages.
 * One message per event, separated by newlines.
 */
export function formatAsSyslog(events: PlatformAuditLog[]): FormattedSiemEvent {
  const lines: string[] = [];
  for (const e of events) {
    const timestamp = e.createdAt.toISOString().replace(/[-:.TZ]/g, (c) =>
      c === "T" || c === "Z" ? "" : c,
    );
    const pri = e.severity === "critical" ? 10 : e.severity === "error" ? 12 : e.severity === "warning" ? 14 : 16;
    const appName = "AQLIYA";
    const msgId = e.action.replace(/\s+/g, "_");
    const structuredData = e.platformOrganizationId
      ? `[org@aqliya orgId="${e.platformOrganizationId}"]`
      : "-";
    const msg = e.actorName
      ? `${e.productKey}: ${e.action} by ${e.actorName}`
      : `${e.productKey}: ${e.action}`;
    lines.push(
      `<${pri}>1 ${timestamp} ${e.sourceSystem ?? "aqliya"} ${appName} ${e.id} ${msgId} ${structuredData} ${msg}`,
    );
  }
  return {
    format: "syslog",
    body: lines.join("\n"),
    contentType: "text/plain",
  };
}

/**
 * Format audit log events as ArcSight CEF format.
 * CEF: version|device_vendor|device_product|device_version|signature_id|name|severity|extension
 */
export function formatAsCef(events: PlatformAuditLog[]): FormattedSiemEvent {
  const lines: string[] = [];
  for (const e of events) {
    const deviceVendor = "AQLIYA";
    const deviceProduct = "Platform";
    const deviceVersion = "1.0";
    const signatureId = e.action;
    const name = `${e.productKey}: ${e.action}`;
    const cefSeverity = e.severity === "critical" ? "10"
      : e.severity === "error" ? "8"
      : e.severity === "warning" ? "5"
      : "3";
    const ext: string[] = [];
    ext.push(`act=${escapeCefValue(e.action)}`);
    ext.push(`cs1=${e.productKey} cs1Label=productKey`);
    if (e.actorId) ext.push(`suser=${e.actorId}`);
    if (e.actorName) ext.push(`suName=${escapeCefValue(e.actorName)}`);
    if (e.actorEmail) ext.push(`suEmail=${e.actorEmail}`);
    if (e.targetType) ext.push(`duser=${e.targetType}`);
    if (e.targetId) ext.push(`duserId=${e.targetId}`);
    if (e.platformOrganizationId) ext.push(`cs2=${e.platformOrganizationId} cs2Label=orgId`);
    if (e.clientWorkspaceId) ext.push(`cs3=${e.clientWorkspaceId} cs3Label=workspaceId`);
    if (e.sourceSystem) ext.push(`cs4=${e.sourceSystem} cs4Label=sourceSystem`);
    if (e.ipAddress) ext.push(`src=${e.ipAddress}`);
    if (e.status) ext.push(`outcome=${e.status}`);
    ext.push(`rt=${Math.floor(e.createdAt.getTime() / 1000)}`);
    const line = `CEF:0|${deviceVendor}|${deviceProduct}|${deviceVersion}|${escapeCefValue(signatureId)}|${escapeCefValue(name)}|${cefSeverity}|${ext.join(" ")}`;
    lines.push(line);
  }
  return {
    format: "cef",
    body: lines.join("\n"),
    contentType: "text/plain",
  };
}

function escapeCefValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/=/g, "\\=").replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

/**
 * Format audit log events for Splunk HTTP Event Collector format.
 */
export function formatAsSplunkHec(events: PlatformAuditLog[]): FormattedSiemEvent {
  const eventsFormatted = events.map((e) => ({
    time: e.createdAt.getTime() / 1000,
    host: e.sourceSystem ?? "aqliya",
    source: e.productKey,
    sourcetype: "aqliya:audit:log",
    index: "aqliya_audit",
    event: {
      id: e.id,
      productKey: e.productKey,
      action: e.action,
      actor: {
        id: e.actorId,
        type: e.actorType,
        email: e.actorEmail,
        name: e.actorName,
      },
      target: {
        type: e.targetType,
        id: e.targetId,
        label: e.targetLabel,
      },
      organizationId: e.platformOrganizationId,
      workspaceId: e.clientWorkspaceId,
      projectId: e.projectId,
      environment: e.environment,
      severity: e.severity,
      status: e.status,
      source: {
        system: e.sourceSystem,
        ip: e.ipAddress,
        userAgent: e.userAgent,
      },
      evidenceRefs: e.evidenceRefs,
      metadata: e.metadata,
    },
  }));
  return {
    format: "splunk-hec",
    body: JSON.stringify(eventsFormatted),
    contentType: "application/json",
  };
}
