import { NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { getHistory } from "@/lib/platform/retention/history-store";

export async function GET() {
  try {
    await requireUserContext("ADMIN");
    return NextResponse.json({ history: getHistory() });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
