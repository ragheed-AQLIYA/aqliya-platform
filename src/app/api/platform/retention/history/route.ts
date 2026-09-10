import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getHistory } from "@/lib/core/policy/retention/history-store";
import { assertPlatformAdmin } from "@/lib/authorization/platform-admin";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

export async function GET() {
  try {
    const user = await getCurrentUser();
    assertPlatformAdmin(user);
    return NextResponse.json({ history: getHistory() });
  } catch (error) {
    const { message, code } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}
