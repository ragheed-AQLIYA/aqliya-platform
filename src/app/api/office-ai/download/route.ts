import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

// ─── Per-user in-memory rate limiter for downloads ───
const downloadRateMap = new Map<string, { count: number; resetAt: number }>();
const DOWNLOAD_WINDOW_MS = 60_000;
const DOWNLOAD_MAX = 30;

function checkDownloadRateLimit(userId: string): void {
  const now = Date.now();
  const entry = downloadRateMap.get(userId);
  if (!entry || now > entry.resetAt) {
    downloadRateMap.set(userId, {
      count: 1,
      resetAt: now + DOWNLOAD_WINDOW_MS,
    });
    return;
  }
  if (entry.count >= DOWNLOAD_MAX) {
    throw new Error("Download rate limit exceeded. Please try again later.");
  }
  entry.count++;
}

// Periodic cleanup
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of downloadRateMap) {
      if (now > v.resetAt) downloadRateMap.delete(k);
    }
  }, DOWNLOAD_WINDOW_MS);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
    checkDownloadRateLimit(user.id);

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

    if (
      !output ||
      !user.platformOrganizationId ||
      output.task.platformOrganizationId !== user.platformOrganizationId
    ) {
      return new NextResponse("Output not found", { status: 404 });
    }

    await writePlatformAuditLog({
      productKey: "office_ai",
      action: "output.download",
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorType: user.role,
      actorName: user.name,
      targetType: "office_ai_output",
      targetId: outputId,
      targetLabel: output.task.title || output.task.taskType || "output",
      sourceSystem: "office_ai_download",
      status: "success",
    });

    const filename = output.task.title || output.task.taskType || "output";
    const safeName = filename.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_");

    if (format === "print") {
      const escapedContent = escapeHtml(output.content);
      const escapedTaskType = escapeHtml(output.task.taskType);
      const escapedFormat = escapeHtml(output.format);
      const escapedTimestamp = escapeHtml(output.createdAt.toISOString());
      const html = `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(safeName)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    pre { white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 8px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(safeName)}</h1>
  <div class="meta">Task: ${escapedTaskType} | Format: ${escapedFormat} | Generated: ${escapedTimestamp}</div>
  <pre>${escapedContent}</pre>
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
    if (error instanceof Error && error.message.includes("rate limit")) {
      return new NextResponse("Too many requests. Please try again later.", {
        status: 429,
      });
    }

    console.error("[OfficeAiDownload] Failed to serve output:", error);
    return new NextResponse("Failed to serve output", { status: 500 });
  }
}
