import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { dryRun } from "@/lib/core/policy/retention/engine";
import { getPolicyForModel } from "@/lib/core/policy/retention/policies";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    const body = (await request.json().catch(() => ({}))) as { modelName?: string };

    let targetPolicy;
    if (body.modelName) {
      targetPolicy = getPolicyForModel(body.modelName, user.platformOrganizationId);
      if (!targetPolicy) {
        return NextResponse.json({ error: "Unknown model" }, { status: 400 });
      }
    }

    const results = await dryRun(targetPolicy, user.platformOrganizationId);
    return NextResponse.json({ results });
  } catch (err) {
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}
