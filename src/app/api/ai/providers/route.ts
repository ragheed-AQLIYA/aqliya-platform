import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next";
import { getAiSettingsAction } from "@/actions/ai-settings-actions";
import { aiOrchestrator } from "@/lib/ai/orchestrator";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getAiSettingsAction();
    const providers = aiOrchestrator.getAllStatus();

    return NextResponse.json({
      settings,
      providers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
