/**
 * Phase 8 — Knowledge Mining Server Actions.
 *
 * Security hardening (Phase 8.3):
 * - Actor identity is ALWAYS derived from session, never from caller.
 * - Role enforcement at the action layer (final authority).
 * - Viewer: read-only (list, detail, KPIs).
 * - Operator: mutations (submit, approve, reject, promote, batch promote, run pipeline).
 * - Admin: delete.
 */

"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { listCandidates, getCandidate, deleteCandidate } from "@/lib/tb-intelligence/knowledge-mining";
import {
  runFullMiningPipeline,
} from "@/lib/tb-intelligence/knowledge-mining/candidate-rule-generator";
import {
  applyReviewDecision,
  submitForReview,
} from "@/lib/tb-intelligence/knowledge-mining/review-workflow";
import {
  promoteCandidates,
  batchPromoteCandidates,
} from "@/lib/tb-intelligence/knowledge-mining/promotion-service";
import { getKnowledgeMiningKPIs } from "@/lib/tb-intelligence/knowledge-mining/kpis";
import type { CandidateFilter } from "@/lib/tb-intelligence/knowledge-mining";
import type { KnowledgeMiningKPIs } from "@/lib/tb-intelligence/knowledge-mining/types";

/* ── Helpers ─────────────────────────────────── */

async function assertOperator(user: { role: string }): Promise<void> {
  if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
    throw new Error("Access denied: OPERATOR role required");
  }
}

async function assertAdmin(user: { role: string }): Promise<void> {
  if (user.role !== "ADMIN") {
    throw new Error("Access denied: ADMIN role required");
  }
}

/* ── Read Actions (VIEWER minimum) ──────────── */

/**
 * List knowledge candidates.
 * Viewer-allowed — read-only.
 */
export async function getCandidates(filter: CandidateFilter = {}) {
  await getCurrentUser(); // session check only — viewer can read
  try {
    return await listCandidates(filter);
  } catch (error) {
    return { candidates: [], total: 0, error: String(error) };
  }
}

/**
 * Get a single candidate with full detail.
 * Viewer-allowed — read-only.
 */
export async function getCandidateDetail(id: string) {
  await getCurrentUser(); // session check only — viewer can read
  try {
    return await getCandidate(id);
  } catch (error) {
    return { candidate: null, evidence: [], promotions: [], error: String(error) };
  }
}

/**
 * Get knowledge mining KPIs.
 * Viewer-allowed — read-only.
 */
export async function getKPIs(): Promise<KnowledgeMiningKPIs | { error: string }> {
  await getCurrentUser(); // session check only — viewer can read
  try {
    return await getKnowledgeMiningKPIs();
  } catch (error) {
    return { error: String(error) };
  }
}

/* ── Mutation Actions (OPERATOR minimum) ────── */

/**
 * Run the full mining pipeline: aggregate patterns → generate candidates.
 * Requires OPERATOR.
 * Actor identity derived from session — caller-supplied ID ignored.
 */
export async function runMiningPipeline() {
  try {
    const user = await getCurrentUser();
    await assertOperator(user);
    const result = await runFullMiningPipeline({
      createdById: user.id,
    });
    revalidatePath("/api/knowledge-mining/candidates");
    return { success: true, ...result };
  } catch (error) {
    return {
      success: false,
      candidatesCreated: 0,
      candidatesSkippedExisting: 0,
      patternsFound: 0,
      totalPatternsProcessed: 0,
      error: String(error),
    };
  }
}

/**
 * Submit a candidate for review.
 * Requires OPERATOR.
 * Actor identity derived from session — caller-supplied ID IGNORED.
 */
export async function submitCandidateForReview(candidateId: string) {
  try {
    const user = await getCurrentUser();
    await assertOperator(user);
    const result = await submitForReview(candidateId, user.id);
    revalidatePath("/api/knowledge-mining/candidates");
    return result;
  } catch (error) {
    return { success: false, candidateId, newStatus: "ERROR", error: String(error) };
  }
}

/**
 * Approve a candidate.
 * Requires OPERATOR.
 * Actor identity derived from session — caller-supplied ID IGNORED.
 */
export async function approveCandidate(candidateId: string, notes?: string) {
  try {
    const user = await getCurrentUser();
    await assertOperator(user);
    const result = await applyReviewDecision({
      candidateId,
      reviewerId: user.id,
      decision: "APPROVED",
      notes,
    });
    revalidatePath("/api/knowledge-mining/candidates");
    return result;
  } catch (error) {
    return { success: false, candidateId, newStatus: "ERROR", error: String(error) };
  }
}

/**
 * Reject a candidate.
 * Requires OPERATOR.
 * Actor identity derived from session — caller-supplied ID IGNORED.
 */
export async function rejectCandidate(candidateId: string, notes?: string) {
  try {
    const user = await getCurrentUser();
    await assertOperator(user);
    const result = await applyReviewDecision({
      candidateId,
      reviewerId: user.id,
      decision: "REJECTED",
      notes,
    });
    revalidatePath("/api/knowledge-mining/candidates");
    return result;
  } catch (error) {
    return { success: false, candidateId, newStatus: "ERROR", error: String(error) };
  }
}

/**
 * Promote an approved candidate to a knowledge artifact.
 * Requires OPERATOR.
 * Actor identity derived from session — caller-supplied ID IGNORED.
 */
export async function promoteCandidate(
  candidateId: string,
  artifactType: "candidate-synonyms" | "candidate-rule-pack",
  notes?: string,
) {
  try {
    const user = await getCurrentUser();
    await assertOperator(user);
    const result = await promoteCandidates({
      candidateId,
      promotedBy: user.id,
      artifactType,
      notes,
    });
    revalidatePath("/api/knowledge-mining/candidates");
    return result;
  } catch (error) {
    return { success: false, artifactPath: "", error: String(error) };
  }
}

/**
 * Batch promote all approved candidates.
 * Requires OPERATOR.
 * Actor identity derived from session — caller-supplied ID IGNORED.
 */
export async function batchPromote(
  artifactType: "candidate-synonyms" | "candidate-rule-pack",
  notes?: string,
) {
  try {
    const user = await getCurrentUser();
    await assertOperator(user);
    const result = await batchPromoteCandidates({
      promotedBy: user.id,
      artifactType,
      notes,
    });
    revalidatePath("/api/knowledge-mining/candidates");
    return result;
  } catch (error) {
    return { promoted: 0, artifactPath: "", error: String(error) };
  }
}

/* ── Admin Actions ───────────────────────────── */

/**
 * Delete a candidate.
 * Requires ADMIN only.
 */
export async function removeCandidate(id: string) {
  try {
    const user = await getCurrentUser();
    await assertAdmin(user);
    const result = await deleteCandidate(id);
    revalidatePath("/api/knowledge-mining/candidates");
    return { success: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
