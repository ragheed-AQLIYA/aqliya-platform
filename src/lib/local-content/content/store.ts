// LocalContentOS Content Studio — file-backed interim store (test / explicit LOCALCONTENT_CONTENT_BACKEND=file).
// Production-like env guard: repository-instance.ts refuses silent Prisma→file fallback and warns on file use.

import "server-only";

import { promises as fs } from "fs";
import path from "path";
import type { ContentStudioStore } from "./types";

const EMPTY_STORE: ContentStudioStore = {
  projects: [],
  campaigns: [],
  sources: [],
  contentItems: [],
  reviews: [],
  approvals: [],
  outputs: [],
};

function storePath(): string {
  return path.join(process.cwd(), ".data", "localcontentos-content", "store.json");
}

let memoryCache: ContentStudioStore | null = null;

async function ensureDir(): Promise<void> {
  const dir = path.dirname(storePath());
  await fs.mkdir(dir, { recursive: true });
}

export async function readStore(): Promise<ContentStudioStore> {
  if (memoryCache) return structuredClone(memoryCache);
  try {
    const raw = await fs.readFile(storePath(), "utf-8");
    memoryCache = JSON.parse(raw) as ContentStudioStore;
    return structuredClone(memoryCache);
  } catch {
    memoryCache = structuredClone(EMPTY_STORE);
    return structuredClone(memoryCache);
  }
}

export async function writeStore(store: ContentStudioStore): Promise<void> {
  await ensureDir();
  memoryCache = structuredClone(store);
  await fs.writeFile(storePath(), JSON.stringify(store, null, 2), "utf-8");
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Test helper — reset in-memory cache and interim store file */
export async function resetStoreCacheForTests(): Promise<void> {
  memoryCache = null;
  try {
    await fs.unlink(storePath());
  } catch {
    // file may not exist
  }
}
