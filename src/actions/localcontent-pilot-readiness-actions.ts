// ─── LocalContentOS — Pilot Readiness Server Actions ───
// V3.5 Phase 5: Single operational readiness page.

"use server";

import { requireUserContext } from "@/lib/auth";
import { getPilotReadiness } from "@/lib/local-content/pilot-readiness";

interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function getPilotReadinessAction(): Promise<ActionResult> {
  try {
    const user = await requireUserContext();
    if (!user.organizationId) {
      return { ok: false, error: "No organization context" };
    }

    const report = await getPilotReadiness(user.organizationId);
    return { ok: true, data: report };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to get pilot readiness",
    };
  }
}
