import { NextResponse } from "next/server";
import { getAllPolicies } from "@/lib/core/policy/retention/policies";
import { getCurrentUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/kernel";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const policies = getAllPolicies();
  return NextResponse.json({ policies });
}
