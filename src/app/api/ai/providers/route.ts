import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next";
import { getAiSettingsAction } from "@/actions/ai-settings-actions";
import { aiOrchestrator } from "@/lib/core/ai/orchestrator";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";
import { listPromptTemplates } from "@/lib/ai/prompt-templates";

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
      quality: {
        enabled: true,
        confidenceScorer: true,
        evalGate: true,
        templates: listPromptTemplates().map(t => ({ id: t.id, name: t.name })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const { message, code } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}
