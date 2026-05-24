import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";

function getAllowedDownloadFormat(
  format: string | null,
): "md" | "txt" | "print" {
  if (format === "txt" || format === "print") {
    return format;
  }

  return "md";
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUserContext("VIEWER");

    const outputId = request.nextUrl.searchParams.get("outputId");
    const format = getAllowedDownloadFormat(
      request.nextUrl.searchParams.get("format"),
    );

    if (!outputId) {
      return new NextResponse("Missing outputId parameter", { status: 400 });
    }

    const output = await prisma.officeAiOutput.findUnique({
      where: { id: outputId },
      include: {
        task: {
          select: {
            title: true,
            taskType: true,
            platformOrganizationId: true,
          },
        },
      },
    });

    if (!output) {
      return new NextResponse("Output not found", { status: 404 });
    }

    if (
      !user.platformOrganizationId ||
      output.task.platformOrganizationId !== user.platformOrganizationId
    ) {
      return new NextResponse("Access denied", { status: 403 });
    }

    const filename = output.task.title || output.task.taskType || "output";
    const safeName = filename.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_");

    if (format === "print") {
      const html = `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${safeName}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    pre { white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 8px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${safeName}</h1>
  <div class="meta">Task: ${output.task.taskType} | Format: ${output.format} | Generated: ${output.createdAt.toISOString()}</div>
  <pre>${output.content}</pre>
  <script>window.print()</script>
</body>
</html>`;
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const contentType =
      format === "txt"
        ? "text/plain; charset=utf-8"
        : "text/markdown; charset=utf-8";
    const ext = format === "txt" ? "txt" : "md";

    return new NextResponse(output.content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeName}.${ext}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthenticated") {
      return new NextResponse("Authentication required", { status: 401 });
    }

    console.error("[OfficeAiDownload] Failed to serve output:", error);
    return new NextResponse("Failed to serve output", { status: 500 });
  }
}
