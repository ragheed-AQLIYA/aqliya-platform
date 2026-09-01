import { NextResponse } from "next/server";
import { getAllPolicies } from "@/lib/core/policy/retention/policies";
import { getCurrentUser } from "@/lib/auth";
import { assertPlatformAdmin } from "@/lib/authorization/platform-admin";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

export async function GET() {
  try {
    const user = await getCurrentUser();
    assertPlatformAdmin(user);
    const policies = getAllPolicies();
    return NextResponse.json({ policies });
  } catch (error) {
    const { message, code } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}
