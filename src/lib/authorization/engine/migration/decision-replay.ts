/**
 * RB-02B Decision Replay System
 *
 * Converts shadow evaluation records into a replayable regression dataset.
 * Enables running historical requests against new engine versions to detect drift.
 *
 * Design:
 * - ReplayRecord contains only non-sensitive, non-PII data
 * - ReplayDataset can be stored as JSON and loaded for regression testing
 * - ReplayRunner compares engine v1 vs engine v2 output
 *
 * @see OPERATIONAL_CERTIFICATION_GATE.md
 */

import { Decision } from '../types';
import type { AuthorizationRequest, AuthorizationDecision } from '../types';
import type { AuthorizationEngine } from '../engine';
import type { ShadowRecord } from './shadow-logger';

// ─── Replay Record ───────────────────────────────────────────────

/**
 * A sanitized authorization request for replay.
 * Contains NO PII, NO user IDs, NO organization IDs.
 * Contains only the structural properties needed for authorization.
 */
export interface ReplayRecord {
  /** The resource type (e.g., "decision") */
  resourceType: string;
  /** The action being performed (e.g., "decision.access") */
  action: string;
  /** The platform role (e.g., "BUSINESS_MANAGER") */
  role: string;
  /** The expected decision from the legacy system */
  expectedDecision: Decision;
  /** Which policies were exercised (for reachability analysis) */
  policiesExercised: string[];
  /** Context — only non-sensitive fields */
  context?: Record<string, unknown>;
  /** Original fingerprint for traceability */
  originalFingerprint: string;
  /** Timestamp of the original evaluation */
  originalTimestamp: string;
}

/**
 * A complete replay dataset — a list of sanitized requests.
 */
export interface ReplayDataset {
  /** Dataset metadata */
  metadata: {
    name: string;
    generatedAt: string;
    recordCount: number;
    engineVersion: string;
    source: string;
    description: string;
  };
  /** The records */
  records: ReplayRecord[];
}

/**
 * Result of replaying a single record against an engine.
 */
export interface ReplayResult {
  record: ReplayRecord;
  engineDecision: Decision;
  isMatch: boolean;
  mismatchType?: string;
  engineTrace?: string;
}

/**
 * Summary of a replay run.
 */
export interface ReplaySummary {
  datasetName: string;
  totalRecords: number;
  matches: number;
  mismatches: number;
  matchRate: number;
  results: ReplayResult[];
}

// ─── Dataset Builder ─────────────────────────────────────────────

/**
 * Build a replay dataset from shadow logger records.
 * Strips all PII — only keeps structural authorization properties.
 *
 * @param records Source shadow records
 * @param name Dataset name (e.g., "decisionos-shadow-nov-2024")
 * @param description Dataset description
 */
export function buildReplayDataset(
  records: ShadowRecord[],
  name: string,
  description: string,
): ReplayDataset {
  const replayRecords: ReplayRecord[] = [];

  for (const record of records) {
    const fp = `${record.resourceType}|${record.action}|${record.role}`;

    replayRecords.push({
      resourceType: record.resourceType,
      action: record.action,
      role: record.role,
      expectedDecision: record.engineDecision,
      policiesExercised: record.policiesExercised,
      context: record.engineDecision !== Decision.ALLOW
        ? { restricted: true }
        : undefined,
      originalFingerprint: fp,
      originalTimestamp: record.timestamp,
    });
  }

  return {
    metadata: {
      name,
      generatedAt: new Date().toISOString(),
      recordCount: replayRecords.length,
      engineVersion: '1.0.0',
      source: 'W4A Shadow Logger',
      description,
    },
    records: replayRecords,
  };
}

/**
 * Load a replay dataset from a JSON string.
 */
export function loadReplayDataset(json: string): ReplayDataset {
  return JSON.parse(json) as ReplayDataset;
}

/**
 * Serialize a replay dataset to JSON.
 */
export function serializeReplayDataset(dataset: ReplayDataset): string {
  return JSON.stringify(dataset, null, 2);
}

/**
 * Save a replay dataset to a file path (Node.js only).
 */
export async function saveReplayDataset(
  dataset: ReplayDataset,
  filePath: string,
): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, serializeReplayDataset(dataset), 'utf-8');
}

// ─── Replay Runner ───────────────────────────────────────────────

/**
 * Replay a dataset against an engine and produce a comparison result.
 *
 * @param engine The authorization engine to test
 * @param dataset The replay dataset
 */
export async function replayDataset(
  engine: AuthorizationEngine,
  dataset: ReplayDataset,
): Promise<ReplaySummary> {
  const results: ReplayResult[] = [];
  const anonymizedId = 'replay-user';

  for (const record of dataset.records) {
    const request: AuthorizationRequest = {
      userId: anonymizedId,
      organizationId: 'replay-org',
      role: record.role,
      resourceType: record.resourceType,
      action: record.action,
      context: record.context,
    };

    let engineDecision: Decision;
    let engineTrace: string | undefined;

    try {
      const result: AuthorizationDecision = await engine.authorize(request);
      engineDecision = result.decision;
      engineTrace = JSON.stringify(result.trace);
    } catch {
      engineDecision = Decision.DENY; // Fail closed
    }

    const isMatch = engineDecision === record.expectedDecision;

    results.push({
      record,
      engineDecision,
      isMatch,
      mismatchType: isMatch ? undefined : `${record.expectedDecision} → ${engineDecision}`,
      engineTrace,
    });
  }

  const matches = results.filter((r) => r.isMatch).length;
  const total = results.length;

  return {
    datasetName: dataset.metadata.name,
    totalRecords: total,
    matches,
    mismatches: total - matches,
    matchRate: total > 0 ? Math.round((matches / total) * 10000) / 100 : 0,
    results,
  };
}
