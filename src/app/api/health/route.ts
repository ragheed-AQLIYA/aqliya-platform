import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkLocalStorageWritable,
  collectRuntimeEnvChecks,
} from "@/lib/platform/runtime-env-check";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};
  const warnings: string[] = [];

  for (const envCheck of collectRuntimeEnvChecks()) {
    if (envCheck.severity === "error") {
      checks[envCheck.key] = { ok: false, detail: envCheck.message };
    } else if (envCheck.severity === "warning") {
      warnings.push(`${envCheck.key}: ${envCheck.message}`);
    }
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true, detail: "connected" };
  } catch (error) {
    checks.database = {
      ok: false,
      detail: error instanceof Error ? error.message : "connection failed",
    };
  }

  const storageProvider =
    (process.env.STORAGE_PROVIDER as string | undefined) ?? "local";
  if (storageProvider === "local") {
    const storage = await checkLocalStorageWritable();
    checks.storage = {
      ok: storage.ok,
      detail: storage.ok
        ? `writable (${storage.path})`
        : `${storage.path} — ${storage.detail}`,
    };
  } else {
    checks.storage = {
      ok: false,
      detail: `${storageProvider} provider not integrated for v0.1`,
    };
  }

  const failed = Object.values(checks).some((c) => !c.ok);
  const status = failed ? "degraded" : "ok";

  return NextResponse.json(
    {
      status,
      service: "aqliya",
      product: "platform",
      timestamp: new Date().toISOString(),
      checks,
      warnings: warnings.length > 0 ? warnings : undefined,
      note:
        status === "ok"
          ? "Liveness check only — not enterprise certification."
          : "One or more runtime checks failed. See checks object.",
    },
    { status: failed ? 503 : 200 },
  );
}
