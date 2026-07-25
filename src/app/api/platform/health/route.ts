import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Kernel } from "@/lib/kernel";
import { getTracingStatus } from "@/lib/observability/tracing";

export const dynamic = "force-dynamic";

type CheckResult = {
  status: "ok" | "error";
  latencyMs?: number;
  error?: string;
};

/**
 * Platform health check endpoint.
 * Returns 200 when all checks pass, 503 when any check fails.
 * Safe for load balancers and uptime monitors (no auth required).
 */
export async function GET() {
  const checks: Record<string, CheckResult> = {};

  // Database connectivity check
  const dbStart = Date.now();
  try {
    // SAFE: Prisma tagged template literal ($queryRaw) — parameterized, no concatenation.
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok", latencyMs: Date.now() - dbStart };
  } catch (e) {
    checks.database = {
      status: "error",
      latencyMs: Date.now() - dbStart,
      error: e instanceof Error ? e.message : "Unknown database error",
    };
  }

  // Kernel health check (non-blocking — skip if not initialized)
  const kernelStart = Date.now();
  try {
    const kernel = Kernel.getInstance();
    if (kernel.isInitialized()) {
      const kernelHealth = await kernel.healthCheck();
      checks.kernel = {
        status: kernelHealth.status === "healthy" ? "ok" : "error",
        latencyMs: Date.now() - kernelStart,
      };
      for (const [pluginId, pluginStatus] of Object.entries(kernelHealth.services)) {
        checks[`kernel.${pluginId}`] = {
          status: pluginStatus === "healthy" ? "ok" : "error",
        };
      }
    }
  } catch {
    // Kernel not available — non-blocking, skip
  }

  // Distributed tracing health check (non-blocking)
  try {
    const tracingStatus = getTracingStatus();
    checks.tracing = {
      status: tracingStatus.initialized ? "ok" : "error",
      latencyMs: 0,
      error: tracingStatus.initialized
        ? undefined
        : "Tracing not initialized",
    };
  } catch {
    checks.tracing = {
      status: "error",
      error: "Tracing status unavailable",
    };
  }

  // Overall status: healthy only if ALL checks pass
  const overall = Object.values(checks).every((c) => c.status === "ok")
    ? "healthy"
    : "degraded";

  return NextResponse.json(
    {
      status: overall,
      timestamp: new Date().toISOString(),
      checks,
      version: "0.1.0",
    },
    {
      status: overall === "healthy" ? 200 : 503,
    },
  );
}
