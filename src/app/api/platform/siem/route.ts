// ─── SIEM Export API Routes ───
// All routes require ADMIN role + organization context.

import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import {
  exportAuditLogs,
  getExportHistory,
} from "@/lib/platform/siem/export-service";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { SiemFormat, SiemDestination } from "@/lib/platform/siem/types";
import { VALID_SIEM_FORMATS } from "@/lib/platform/siem/types";

const siemExportSchema = z.object({
  _action: z.literal("export").optional(),
  format: z.string().optional(),
  destination: z.object({
    type: z.string(),
    url: z.string().optional(),
    region: z.string().optional(),
  }).optional(),
  filters: z.object({
    productKey: z.string().optional(),
    action: z.string().optional(),
    severity: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    actorId: z.string().optional(),
    targetType: z.string().optional(),
  }).optional(),
});

const siemConfigSchema = z.object({
  _action: z.literal("config"),
  format: z.string().optional(),
  label: z.string().max(200).optional(),
  destination: z.object({
    type: z.string(),
    url: z.string().optional(),
    region: z.string().optional(),
  }).optional(),
  schedule: z.string().max(100).optional(),
  enabled: z.boolean().optional(),
});

// ─── GET /api/platform/siem — list export jobs ───

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { ok: false, error: "Access denied: ADMIN role required" },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit")) || 25, 100);
    const offset = Number(url.searchParams.get("offset")) || 0;
    const organizationId =
      user.platformOrganizationId ?? user.organizationId;

    const jobs = await getExportHistory(organizationId, limit, offset);

    return NextResponse.json({ ok: true, jobs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    if (message === "Unauthenticated" || message.startsWith("Access denied")) {
      return NextResponse.json(
        { ok: false, error: message },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── POST /api/platform/siem - trigger export or configure ───

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { ok: false, error: "Access denied: ADMIN role required" },
        { status: 403 },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { ok: false, error: "Body must be a JSON object" },
        { status: 400 },
      );
    }

    const action = (rawBody as Record<string, unknown>)._action ?? "export";
    const organizationId = user.platformOrganizationId ?? user.organizationId;

    if (action === "export") {
      const parsed = siemExportSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json(
          { ok: false, error: parsed.error.issues.map((i) => i.message).join(" ") },
          { status: 400 },
        );
      }
      return handleExport(user.id, organizationId, parsed.data);
    }

    if (action === "config") {
      const parsed = siemConfigSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json(
          { ok: false, error: parsed.error.issues.map((i) => i.message).join(" ") },
          { status: 400 },
        );
      }
      return handleConfig(user.id, organizationId, parsed.data);
    }

    return NextResponse.json(
      { ok: false, error: "Unknown action" },
      { status: 400 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    if (message === "Unauthenticated" || message.startsWith("Access denied")) {
      return NextResponse.json(
        { ok: false, error: message },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handleExport(
  actorId: string,
  organizationId: string,
  data: z.infer<typeof siemExportSchema>,
): Promise<NextResponse> {
  const format = data.format ?? "json";
  if (!VALID_SIEM_FORMATS.includes(format as SiemFormat)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Unsupported format: ${format}. Use: ${VALID_SIEM_FORMATS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  // Build destination and filters from request
  const destination = data.destination as SiemDestination | undefined;
  const filters = data.filters
    ? {
        productKey: data.filters.productKey,
        action: data.filters.action,
        severity: data.filters.severity,
        startDate: data.filters.startDate,
        endDate: data.filters.endDate,
        actorId: data.filters.actorId,
        targetType: data.filters.targetType,
      }
    : undefined;

  const result = await exportAuditLogs({
    organizationId,
    format: format as SiemFormat,
    destination,
    filters,
    initiatedBy: actorId,
  });

  // Audit the SIEM export action
  await writePlatformAuditLog({
    productKey: "platform",
    action: "siem.api.export",
    platformOrganizationId: organizationId,
    actorId,
    actorType: "admin",
    targetType: "siem-export",
    severity: result.ok ? "info" : "error",
    status: result.ok ? "success" : "failure",
    sourceSystem: "siem-api",
    metadata: {
      format,
      totalEvents: result.totalEvents,
      jobId: result.jobId,
      error: result.error,
    },
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

interface StoredSiemConfig {
  id: string;
  organizationId: string;
  label: string;
  format: SiemFormat;
  destination: SiemDestination;
  schedule: string;
  enabled: boolean;
  updatedAt: string;
}

// Simple in-memory config store (not persisted — for v0.1)
const configStore = new Map<string, StoredSiemConfig>();

async function handleConfig(
  actorId: string,
  organizationId: string,
  data: z.infer<typeof siemConfigSchema>,
): Promise<NextResponse> {
  const format = data.format ?? "json";
  if (!VALID_SIEM_FORMATS.includes(format as SiemFormat)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Unsupported format: ${format}. Use: ${VALID_SIEM_FORMATS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  const configId = `siem-config-${Date.now()}`;
  const config: StoredSiemConfig = {
    id: configId,
    organizationId,
    label: data.label ?? "SIEM Export",
    format: format as SiemFormat,
    destination: data.destination as SiemDestination,
    schedule: data.schedule ?? "manual",
    enabled: data.enabled !== false,
    updatedAt: new Date().toISOString(),
  };
  configStore.set(configId, config);

  await writePlatformAuditLog({
    productKey: "platform",
    action: "siem.api.config",
    platformOrganizationId: organizationId,
    actorId,
    actorType: "admin",
    targetType: "siem-config",
    targetId: configId,
    severity: "info",
    status: "success",
    sourceSystem: "siem-api",
    metadata: { format, schedule: config.schedule },
  });

  return NextResponse.json({ ok: true, config });
}
