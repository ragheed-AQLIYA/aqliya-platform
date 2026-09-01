import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { processOutboxBatch } from "@/lib/core/events";
import { sanitizeError, sanitizeErrorResponse, httpStatusFromCode } from "@/lib/platform/api-error";
import { assertPlatformAdmin } from "@/lib/authorization/platform-admin";

export const dynamic = "force-dynamic";

/** ADMIN-only outbox poller — Event Bus Phase 1. */
export async function POST() {
  try {
    const user = await getCurrentUser();
    assertPlatformAdmin(user);
    const result = await processOutboxBatch(50);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const { code } = sanitizeError(error);
    return NextResponse.json(sanitizeErrorResponse(error), { status: httpStatusFromCode(code) });
  }
}
