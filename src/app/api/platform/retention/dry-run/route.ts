import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { dryRun } from "@/lib/core/policy/retention/engine";
import { getPolicyForModel } from "@/lib/core/policy/retention/policies";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

const dryRunSchema = z.object({
  modelName: z.string().optional(),
}).passthrough();

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      rawBody = {};
    }
    const parsed = dryRunSchema.safeParse(rawBody);
    const data = parsed.success ? parsed.data : {};

    let targetPolicy;
    if (data.modelName) {
      targetPolicy = getPolicyForModel(data.modelName, user.platformOrganizationId);
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
