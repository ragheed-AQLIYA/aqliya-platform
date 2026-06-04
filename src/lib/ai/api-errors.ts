import { NextResponse } from "next/server"

export function handleAiApiError(error: unknown, code = "AI_API_ERROR"): NextResponse {
  const msg = error instanceof Error ? error.message : "Unknown error"
  if (msg === "Unauthenticated") {
    return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED" } }, { status: 401 })
  }
  if (msg.startsWith("Access denied")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: msg } }, { status: 403 })
  }
  if (msg.includes("RAG_DISABLED") || msg.includes("KNOWLEDGE_DISABLED")) {
    return NextResponse.json({ success: false, error: { code: msg } }, { status: 403 })
  }
  return NextResponse.json(
    { success: false, error: { code, message: msg } },
    { status: 500 },
  )
}
