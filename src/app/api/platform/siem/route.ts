// ─── SIEM Export API Routes ───
// All routes require ADMIN role + organization context.

import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import {
  exportAuditLogs,
  getExportHistory,
} from "@/lib/platform/siem/export-service";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { SiemFormat, SiemDestination } from "@/lib/platform/siem/types";
import { VALID_SIEM_FORMATS } from "@/lib/platform/siem/types";

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

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const action = body._action ?? "export";
    const organizationId = user.platformOrganizationId ?? user.organizationId;

    if (action === "export") {
      return handleExport(user.id, organizationId, body);
    }

    if (action === "config") {
      return handleConfig(user.id, organizationId, body);
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
  body: Record<string, unknown>,
): Promise<NextResponse> {
  const format = (body.format as string) ?? "json";
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
  const destination = body.destination
    ? (body.destination as SiemDestination)
    : undefined;
  const filters = body.filters
    ? {
        productKey: (body.filters as Record<string, string>).productKey,
        action: (body.filters as Record<string, string>).action,
        severity: (body.filters as Record<string, string>).severity,
        startDate: (body.filters as Record<string, string>).startDate,
        endDate: (body.filters as Record<string, string>).endDate,
        actorId: (body.filters as Record<string, string>).actorId,
        targetType: (body.filters as Record<string, string>).targetType,
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
  body: Record<string, unknown>,
): Promise<NextResponse> {
  const format = (body.format as string) ?? "json";
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
    label: (body.label as string) ?? "SIEM Export",
    format: format as SiemFormat,
    destination: body.destination as SiemDestination,
    schedule: (body.schedule as string) ?? "manual",
    enabled: body.enabled !== false,
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
