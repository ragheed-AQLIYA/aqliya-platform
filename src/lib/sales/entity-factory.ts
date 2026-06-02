// ─── SalesOS entity factory (governed defaults, no UI) ───

import type { SalesRecordSource, SalesEntityStatus } from "./types";

export function salesEntityId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function salesTimestamps(now = new Date().toISOString()): {
  createdAt: string;
  updatedAt: string;
} {
  return { createdAt: now, updatedAt: now };
}

export function governedDefaults(input?: {
  source?: SalesRecordSource;
  status?: SalesEntityStatus;
  confidence?: number;
}): {
  source: SalesRecordSource;
  status: SalesEntityStatus;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
} {
  const ts = salesTimestamps();
  return {
    source: input?.source ?? "manual",
    status: input?.status ?? "active",
    confidence: input?.confidence,
    ...ts,
  };
}

export function draftAIConfidence(score: number): number {
  return Math.min(1, Math.max(0, score));
}
