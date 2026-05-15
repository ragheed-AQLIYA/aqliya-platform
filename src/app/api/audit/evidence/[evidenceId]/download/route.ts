import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStorageProvider } from "@/lib/audit/storage"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ evidenceId: string }> },
) {
  const { evidenceId } = await params

  try {
    const evidence = await prisma.auditEvidence.findUnique({
      where: { id: evidenceId },
      include: { engagement: { select: { organizationId: true } } },
    })

    if (!evidence || !evidence.storageKey) {
      return NextResponse.json({ error: "Evidence not found or no file stored" }, { status: 404 })
    }

    const storage = getStorageProvider()
    const file = await storage.retrieve(evidence.storageKey)

    if (!file) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 })
    }

    const body = new Uint8Array(file.content)
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${evidence.filename}"`,
        "Content-Length": String(file.sizeBytes),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[EvidenceDownload] Error serving file:", error)
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 })
  }
}
