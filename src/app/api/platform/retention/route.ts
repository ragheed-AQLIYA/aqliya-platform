import { NextResponse } from "next/server";
import { getAllPolicies } from "@/lib/core/policy/retention/policies";

export async function GET() {
  const policies = getAllPolicies();
  return NextResponse.json({ policies });
}
