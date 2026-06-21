import "server-only";

import { prisma } from "@/lib/prisma";
import { isOutboxEnabled } from "@/lib/core/events/outbox-service";
import { listEventSchemas } from "@/lib/core/events/schema-registry";
import { checkRedisHealth } from "@/lib/platform/monitoring/system-monitor";
import { isEnabled } from "@/lib/platform/feature-flags/registry";

export type EnterpriseHealthAlert = {
  severity: "info" | "warning" | "critical";
  code: string;
  message: string;
};

export type EnterpriseHealthSnapshot = {
  generatedAt: string;
  program: "tier3-enterprise-prep";
  rateLimiter: {
    mode: string;
    redisUrlConfigured: boolean;
    redisReachable: boolean | null;
  };
  intelligenceCore: {
    outboxEnabled: boolean;
    schemaRegistryTypes: number;
    eventSchemaValidation: boolean;
    abacShadow: boolean;
    abacEnforce: boolean;
    abacEnforceOrgCount: number;
    isaRules: boolean;
  };
  outbox: {
    pending: number;
    failed: number;
    processing: number;
    recentFailed: Array<{
      id: string;
      eventType: string;
      lastError: string | null;
      attempts: number;
      createdAt: Date;
    }>;
  };
  alerts: EnterpriseHealthAlert[];
};

function parseEnforceOrgCount(): number {
  const raw = process.env.ABAC_ENFORCE_ORG_IDS ?? "";
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean).length;
}

function buildAlerts(input: {
  rateLimiterMode: string;
  redisUrlConfigured: boolean;
  redisReachable: boolean | null;
  outboxFailed: number;
  abacEnforce: boolean;
  abacEnforceOrgCount: number;
}): EnterpriseHealthAlert[] {
  const alerts: EnterpriseHealthAlert[] = [];

  if (input.rateLimiterMode === "memory") {
    alerts.push({
      severity: "warning",
      code: "RATE_LIMITER_MEMORY",
      message:
        "RATE_LIMITER=memory — not safe for multi-instance ECS; set RATE_LIMITER=redis in production.",
    });
  }

  if (input.rateLimiterMode === "redis" && input.redisUrlConfigured && input.redisReachable === false) {
    alerts.push({
      severity: "critical",
      code: "REDIS_UNREACHABLE",
      message: "RATE_LIMITER=redis but Redis ping failed.",
    });
  }

  if (input.outboxFailed > 0) {
    alerts.push({
      severity: "warning",
      code: "OUTBOX_FAILED_EVENTS",
      message: `${input.outboxFailed} outbox event(s) in failed state — review before production.`,
    });
  }

  if (input.abacEnforce && input.abacEnforceOrgCount === 0) {
    alerts.push({
      severity: "warning",
      code: "ABAC_ENFORCE_NO_ORGS",
      message: "FF_ABAC_ENFORCE=true but ABAC_ENFORCE_ORG_IDS is empty.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      severity: "info",
      code: "TIER3_BASELINE_OK",
      message: "No critical enterprise prep alerts at this snapshot.",
    });
  }

  return alerts;
}

export async function getEnterpriseHealthSnapshot(): Promise<EnterpriseHealthSnapshot> {
  const rateLimiterMode = process.env.RATE_LIMITER ?? "memory";
  const redisUrlConfigured = Boolean(process.env.REDIS_URL);

  let redisReachable: boolean | null = null;
  if (redisUrlConfigured) {
    const redis = await checkRedisHealth();
    redisReachable = redis.status === "ok";
  }

  const outboxEnabled = isOutboxEnabled();
  const [pending, failed, processing, recentFailed] = await Promise.all([
    outboxEnabled
      ? prisma.platformOutboxEvent.count({ where: { status: "pending" } })
      : Promise.resolve(0),
    outboxEnabled
      ? prisma.platformOutboxEvent.count({ where: { status: "failed" } })
      : Promise.resolve(0),
    outboxEnabled
      ? prisma.platformOutboxEvent.count({ where: { status: "processing" } })
      : Promise.resolve(0),
    outboxEnabled
      ? prisma.platformOutboxEvent.findMany({
          where: { status: "failed" },
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: {
            id: true,
            eventType: true,
            lastError: true,
            attempts: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const abacEnforce = isEnabled("platform.abac-enforce");
  const abacEnforceOrgCount = parseEnforceOrgCount();

  const snapshot: EnterpriseHealthSnapshot = {
    generatedAt: new Date().toISOString(),
    program: "tier3-enterprise-prep",
    rateLimiter: {
      mode: rateLimiterMode,
      redisUrlConfigured,
      redisReachable,
    },
    intelligenceCore: {
      outboxEnabled,
      schemaRegistryTypes: listEventSchemas().length,
      eventSchemaValidation: isEnabled("platform.event-schema-registry"),
      abacShadow: isEnabled("platform.abac-shadow"),
      abacEnforce,
      abacEnforceOrgCount,
      isaRules: isEnabled("audit.isa-rules"),
    },
    outbox: {
      pending,
      failed,
      processing,
      recentFailed,
    },
    alerts: [],
  };

  snapshot.alerts = buildAlerts({
    rateLimiterMode,
    redisUrlConfigured,
    redisReachable,
    outboxFailed: failed,
    abacEnforce,
    abacEnforceOrgCount,
  });

  return snapshot;
}

export const EnterpriseHealth = {
  getSnapshot: getEnterpriseHealthSnapshot,
};
