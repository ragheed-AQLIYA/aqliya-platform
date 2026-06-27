import { NextRequest, NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { dryRun } from "@/lib/core/policy/retention/engine";
import { getPolicyForModel } from "@/lib/core/policy/retention/policies";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUserContext("ADMIN");
    const body = (await request.json().catch(() => ({}))) as { modelName?: string };

    let targetPolicy;
    if (body.modelName) {
      targetPolicy = getPolicyForModel(body.modelName, user.platformOrganizationId);
      if (!targetPolicy) {
        return NextResponse.json({ error: `Unknown model: ${body.modelName}` }, { status: 400 });
      }
    }

    const results = await dryRun(targetPolicy, user.platformOrganizationId);
    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof Error && (err.message === "Unauthenticated" || err.message.startsWith("Access denied"))) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
