"use server";

import { isExpectedAccessDeniedError } from "@/lib/auth";
import {
  listSalesDeals,
  listSalesAccounts,
} from "@/lib/sales/services";
import {
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (error instanceof SalesAccessError) {
      return { ok: false, error: error.message, code: error.code };
    }
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[SalesOS Read Action]", message);
    return { ok: false, error: message };
  }
}

/** Thin read actions — services/guards only (no l5-governance / institutional-memory graph). */

export async function listSalesDealsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    return listSalesDeals(ctx.organizationId);
  });
}

export async function listSalesAccountsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    return listSalesAccounts(ctx.organizationId);
  });
}
