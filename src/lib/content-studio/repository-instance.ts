// LocalContentOS Content Studio — repository factory

import "server-only";

import { logger } from "@/lib/logger";
import type { ContentStudioRepository } from "./repository-interface";
import { FileContentStudioRepository } from "./file-repository";
import { PrismaContentStudioRepository } from "./prisma-repository";
import { resetStoreCacheForTests } from "./store";

export type ContentRepositoryBackend = "file" | "prisma";

let instance: ContentStudioRepository | null = null;
let instanceBackend: ContentRepositoryBackend | null = null;
let backendOverride: ContentRepositoryBackend | null = null;

export type ContentRepositoryBackendResolution = {
  backend: ContentRepositoryBackend;
  reason: string;
};

function isProductionLikeContentEnv(): boolean {
  if (process.env.NODE_ENV === "test") return false;
  const envFlag = process.env.LOCALCONTENT_CONTENT_BACKEND?.toLowerCase();
  return process.env.NODE_ENV === "production" || envFlag === "prisma";
}

function guardFileBackendResolution(
  resolution: ContentRepositoryBackendResolution,
): ContentRepositoryBackendResolution {
  if (resolution.backend !== "file" || !isProductionLikeContentEnv()) {
    return resolution;
  }

  const envFlag = process.env.LOCALCONTENT_CONTENT_BACKEND?.toLowerCase();
  const isExplicitFile = envFlag === "file";
  const isPrismaFallback = resolution.reason.includes("fallback");

  if (isExplicitFile || isPrismaFallback) {
    throw new Error(
      `[LocalContentOS Content] File backend refused in production-like environment (${resolution.reason}). Configure DATABASE_URL for Prisma.`,
    );
  }

  logger.warn(
    "File content backend active in production-like environment; institutional path expects Prisma with DATABASE_URL",
    "local-content-content",
    { reason: resolution.reason },
  );
  return resolution;
}

/**
 * Default: Prisma when DATABASE_URL is set.
 * Override with LOCALCONTENT_CONTENT_BACKEND=file|prisma or configureContentRepositoryBackend().
 * Prisma without DATABASE_URL falls back to file in dev/test; production-like envs guard file use.
 */
export function resolveContentRepositoryBackend(): ContentRepositoryBackendResolution {
  const envFlag = process.env.LOCALCONTENT_CONTENT_BACKEND?.toLowerCase();
  const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());

  if (envFlag === "file") {
    return guardFileBackendResolution({
      backend: "file",
      reason: "LOCALCONTENT_CONTENT_BACKEND=file",
    });
  }
  if (envFlag === "prisma") {
    if (!hasDatabase) {
      return guardFileBackendResolution({
        backend: "file",
        reason: "prisma requested but DATABASE_URL missing — fallback to file",
      });
    }
    return { backend: "prisma", reason: "LOCALCONTENT_CONTENT_BACKEND=prisma" };
  }
  if (backendOverride) {
    if (backendOverride === "prisma" && !hasDatabase) {
      return guardFileBackendResolution({
        backend: "file",
        reason: "prisma override but DATABASE_URL missing — fallback to file",
      });
    }
    return guardFileBackendResolution({
      backend: backendOverride,
      reason: "configureContentRepositoryBackend()",
    });
  }
  if (hasDatabase) {
    return { backend: "prisma", reason: "DATABASE_URL present" };
  }
  return guardFileBackendResolution({
    backend: "file",
    reason: "no DATABASE_URL",
  });
}

function resolveBackend(): ContentRepositoryBackend {
  return resolveContentRepositoryBackend().backend;
}

export function getContentRepository(): ContentStudioRepository {
  const backend = resolveBackend();
  if (!instance || instanceBackend !== backend) {
    instance =
      backend === "prisma"
        ? new PrismaContentStudioRepository()
        : new FileContentStudioRepository();
    instanceBackend = backend;
  }
  return instance;
}

export function configureContentRepositoryBackend(
  next: ContentRepositoryBackend,
): void {
  backendOverride = next;
  instance = null;
  instanceBackend = null;
}

export function getContentRepositoryBackend(): ContentRepositoryBackend {
  return resolveBackend();
}

export function describeContentRepositoryBackend(): ContentRepositoryBackendResolution {
  return resolveContentRepositoryBackend();
}

export function setContentRepositoryForTests(
  repo: ContentStudioRepository | null,
): void {
  instance = repo;
}

export function reloadContentRepositoryInstance(): void {
  instance = null;
  instanceBackend = null;
}

export async function resetContentRepositoryForTests(): Promise<void> {
  instance = null;
  instanceBackend = null;
  backendOverride = "file";
  await resetStoreCacheForTests();
}
