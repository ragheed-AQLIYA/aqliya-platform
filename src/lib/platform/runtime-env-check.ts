import "server-only";

import * as fs from "fs";
import { getLocalStoreBaseDir } from "@/lib/platform/storage/local-storage-provider";

export type EnvCheckSeverity = "error" | "warning" | "info";

export interface EnvCheckResult {
  key: string;
  severity: EnvCheckSeverity;
  message: string;
}

function authSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

export function collectRuntimeEnvChecks(): EnvCheckResult[] {
  const checks: EnvCheckResult[] = [];

  if (!process.env.DATABASE_URL) {
    checks.push({
      key: "DATABASE_URL",
      severity: "error",
      message: "PostgreSQL connection string is required.",
    });
  }

  if (!authSecret()) {
    checks.push({
      key: "AUTH_SECRET",
      severity: "error",
      message:
        "NextAuth JWT secret is required. Set AUTH_SECRET (preferred) or NEXTAUTH_SECRET.",
    });
  } else if (authSecret()!.length < 32) {
    checks.push({
      key: "AUTH_SECRET",
      severity: "warning",
      message:
        "Auth secret should be at least 32 characters for production use.",
    });
  }

  if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === "production") {
    checks.push({
      key: "NEXTAUTH_URL",
      severity: "warning",
      message:
        "NEXTAUTH_URL is not set. Auth callbacks may fail behind a reverse proxy.",
    });
  }

  if (!process.env.DOWNLOAD_TOKEN_SECRET) {
    checks.push({
      key: "DOWNLOAD_TOKEN_SECRET",
      severity: "warning",
      message:
        "Signed evidence download tokens require DOWNLOAD_TOKEN_SECRET. Token-based downloads will fail until set.",
    });
  }

  const storageProvider =
    (process.env.STORAGE_PROVIDER as string | undefined) ?? "local";
  if (storageProvider !== "local") {
    checks.push({
      key: "STORAGE_PROVIDER",
      severity: "warning",
      message: `STORAGE_PROVIDER=${storageProvider} is not fully integrated. Use local for controlled v0.1 deployment.`,
    });
  }

  if (process.env.AI_CLOUD_API_KEY && !process.env.AI_CLOUD_BASE_URL) {
    checks.push({
      key: "AI_CLOUD_BASE_URL",
      severity: "warning",
      message: "AI_CLOUD_API_KEY is set but AI_CLOUD_BASE_URL is missing.",
    });
  }

  return checks;
}

export function logStartupEnvWarnings(): void {
  if (process.env.NODE_ENV === "test") return;

  const checks = collectRuntimeEnvChecks();
  const errors = checks.filter((c) => c.severity === "error");
  const warnings = checks.filter((c) => c.severity === "warning");

  if (errors.length === 0 && warnings.length === 0) return;

  console.warn("\n=== AQLIYA Runtime Environment Checks ===");

  for (const check of errors) {
    console.error(`[ENV ERROR] ${check.key}: ${check.message}`);
  }
  for (const check of warnings) {
    console.warn(`[ENV WARN] ${check.key}: ${check.message}`);
  }

  console.warn("=========================================\n");
}

export async function checkLocalStorageWritable(): Promise<{
  ok: boolean;
  path: string;
  detail?: string;
}> {
  const baseDir = getLocalStoreBaseDir();
  try {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    fs.accessSync(baseDir, fs.constants.W_OK);
    return { ok: true, path: baseDir };
  } catch (error) {
    return {
      ok: false,
      path: baseDir,
      detail: error instanceof Error ? error.message : "not writable",
    };
  }
}
