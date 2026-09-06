"use server";

import { prisma } from "@/lib/prisma";
import { getChainHealth } from "@/lib/platform/audit/verification";
import { isEnabled } from "@/lib/platform/feature-flags/registry";

// ─── Types ───

export interface ProductHealthItem {
  productKey: string;
  labelAr: string;
  recordCount: number;
  status: "active" | "idle" | "degraded";
  detail: string;
}

export interface SecurityMetrics {
  rbacEnforce: boolean;
  rbacShadow: boolean;
  rbacEnforceOrgCount: number;
  rateLimiterMode: string;
  redisReachable: boolean | null;
  scannerProvider: string;
  scannerConfigured: boolean;
}

export interface AuditLogHealth {
  totalAuditLogs: number;
  totalChainEntries: number;
  chainHealthy: boolean;
  tamperCount: number;
  lastVerifiedAt: string | null;
  coverageStart: string | null;
  coverageEnd: string | null;
}

// ─── Product Health ───

export async function getProductHealthMetrics(): Promise<ProductHealthItem[]> {
  const [
    auditEngagements,
    auditClients,
    localContentProjects,
    localContentFindings,
    decisions,
    decisionScenarios,
    salesAccounts,
    salesDeals,
    risks,
    workflowRecords,
    platformAuditLogs,
  ] = await Promise.all([
    prisma.auditEngagement.count(),
    prisma.auditClient.count(),
    prisma.localContentProject.count().catch(() => 0),
    prisma.localContentFinding.count().catch(() => 0),
    prisma.decision.count().catch(() => 0),
    prisma.decisionScenario.count().catch(() => 0),
    prisma.salesAccount.count().catch(() => 0),
    prisma.salesDeal.count().catch(() => 0),
    prisma.risk.count().catch(() => 0),
    prisma.workflowRecord.count().catch(() => 0),
    prisma.platformAuditLog.count().catch(() => 0),
  ]);

  const products: ProductHealthItem[] = [
    {
      productKey: "audit_os",
      labelAr: "AuditOS",
      recordCount: auditEngagements + auditClients,
      status: auditEngagements > 0 ? "active" : "idle",
      detail: `${auditEngagements} مهمة · ${auditClients} عميل`,
    },
    {
      productKey: "local_content_os",
      labelAr: "LocalContentOS",
      recordCount: localContentProjects + localContentFindings,
      status: localContentProjects > 0 ? "active" : "idle",
      detail: `${localContentProjects} مشروع · ${localContentFindings} نتيجة`,
    },
    {
      productKey: "decision_os",
      labelAr: "DecisionOS",
      recordCount: decisions + decisionScenarios,
      status: decisions > 0 ? "active" : "idle",
      detail: `${decisions} قرار · ${decisionScenarios} سيناريو`,
    },
    {
      productKey: "sales_os",
      labelAr: "SalesOS",
      recordCount: salesAccounts + salesDeals,
      status: salesAccounts > 0 ? "active" : "idle",
      detail: `${salesAccounts} حساب · ${salesDeals} صفقة`,
    },
    {
      productKey: "risk_os",
      labelAr: "RiskOS",
      recordCount: risks,
      status: risks > 0 ? "active" : "idle",
      detail: `${risks} مخاطر مسجلة`,
    },
    {
      productKey: "workflow_os",
      labelAr: "WorkflowOS",
      recordCount: workflowRecords,
      status: workflowRecords > 0 ? "active" : "idle",
      detail: `${workflowRecords} سجل تدفق`,
    },
  ];

  return products;
}

// ─── Security Metrics ───

export async function getSecurityMetrics(): Promise<SecurityMetrics> {
  const rbacEnforce = isEnabled("platform.abac-enforce");
  const rbacShadow = isEnabled("platform.abac-shadow");
  const rateLimiterMode = process.env.RATE_LIMITER ?? "memory";
  const scannerProvider = process.env.SCANNER_PROVIDER ?? "";

  let redisReachable: boolean | null = null;
  if (rateLimiterMode === "redis" && process.env.REDIS_URL) {
    try {
      const { checkRedisHealth } = await import(
        "@/lib/platform/monitoring/system-monitor"
      );
      const redis = await checkRedisHealth();
      redisReachable = redis.status === "ok";
    } catch {
      redisReachable = false;
    }
  }

  const raw = process.env.ABAC_ENFORCE_ORG_IDS ?? "";
  const rbacEnforceOrgCount = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean).length;

  return {
    rbacEnforce,
    rbacShadow,
    rbacEnforceOrgCount,
    rateLimiterMode,
    redisReachable,
    scannerProvider: scannerProvider || "dev-mock",
    scannerConfigured: Boolean(scannerProvider),
  };
}

// ─── Audit Log Health ───

export async function getAuditLogHealth(): Promise<AuditLogHealth> {
  const [totalAuditLogs, chainHealth] = await Promise.all([
    prisma.platformAuditLog.count().catch(() => 0),
    getChainHealth().catch(() => ({
      healthy: false,
      totalEntries: 0,
      lastVerifiedAt: null,
      coverageStart: null,
      coverageEnd: null,
      tamperCount: 0,
    })),
  ]);

  return {
    totalAuditLogs,
    totalChainEntries: chainHealth.totalEntries,
    chainHealthy: chainHealth.healthy,
    tamperCount: chainHealth.tamperCount,
    lastVerifiedAt: chainHealth.lastVerifiedAt?.toISOString() ?? null,
    coverageStart: chainHealth.coverageStart?.toISOString() ?? null,
    coverageEnd: chainHealth.coverageEnd?.toISOString() ?? null,
  };
}
