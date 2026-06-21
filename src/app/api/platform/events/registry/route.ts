import { NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { CORE_EVENT_SCHEMA_VERSION } from "@/lib/core/contracts/event-envelope";
import { EventSchemaRegistry } from "@/lib/core/events/schema-registry";

export const dynamic = "force-dynamic";

/** ADMIN — registered platform event schemas (Event Bus Phase 2). */
export async function GET() {
  try {
    await requireUserContext("ADMIN");
    const schemas = EventSchemaRegistry.list();
    return NextResponse.json({
      ok: true,
      schemaVersion: CORE_EVENT_SCHEMA_VERSION,
      count: schemas.length,
      schemas,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load event registry";
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
  }
}
