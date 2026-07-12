import { NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { CORE_EVENT_SCHEMA_VERSION } from "@/lib/core/contracts/event-envelope";
import { EventSchemaRegistry } from "@/lib/core/events/schema-registry";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

export const dynamic = "force-dynamic";

/** ADMIN — registered platform event schemas (Event Bus Phase 2). */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    const schemas = EventSchemaRegistry.list();
    return NextResponse.json({
      ok: true,
      schemaVersion: CORE_EVENT_SCHEMA_VERSION,
      count: schemas.length,
      schemas,
    });
  } catch (error) {
    const { message, code } = sanitizeError(error);
    return NextResponse.json({ ok: false, error: message }, { status: httpStatusFromCode(code) });
  }
}
