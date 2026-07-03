import "server-only";
import PDFDocument from "pdfkit";
import {
  registerArabicFonts,
  ARABIC_FONT_NAMES,
} from "@/lib/pdf/fonts/arabic-font-utils";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

// ─── Public Types ───

export interface KnowledgeFoundationExportInput {
  versionId: string;
  versionNumber: string;
  status: string;
  notes: string | null;
  candidateCount: number;
  artifactPath: string | null;
  createdByName: string | null;
  approvedByName: string | null;
  activatedAt: string | null;
  createdAt: string;
  rollbackVersionId: string | null;
  candidateBindings?: Array<{
    phrase: string;
    canonicalCode: string;
    category: string;
    confidence: number;
  }>;
  releases?: Array<{
    id: string;
    releaseNotes: string | null;
    createdAt: string;
    createdByName: string | null;
  }>;
  diffsAsFrom?: Array<{
    toVersion: string;
    riskScore: number;
    breakingChange: boolean;
    summary: string | null;
    generatedAt: string;
  }>;
}

export interface KnowledgeFoundationExportResult {
  format: "pdf" | "json";
  filename: string;
  mimeType: string;
  content: Buffer;
}

// ─── PDF Export ───

export async function buildKnowledgeFoundationPDF(
  input: KnowledgeFoundationExportInput,
): Promise<KnowledgeFoundationExportResult> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 40, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `أساس المعرفة — v${input.versionNumber}`,
      Author: "AQLIYA Knowledge Foundation",
      Subject: "Knowledge Foundation Version Export",
      Creator: "AQLIYA Knowledge Foundation",
    },
  });

  registerArabicFonts(doc);
  const fRegular = (): string => ARABIC_FONT_NAMES.regular;
  const fBold = (): string => ARABIC_FONT_NAMES.bold;

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const endPromise = new Promise<void>((resolve) =>
    doc.on("end", () => resolve()),
  );

  // ── Header ──
  doc.font(fBold()).fontSize(18).text("أساس المعرفة", { align: "right" });
  doc
    .font(fRegular())
    .fontSize(10)
    .fillColor("#666666")
    .text(`AQLIYA Knowledge Foundation — v${input.versionNumber}`, {
      align: "right",
    });
  doc.moveDown(0.5);

  // Separator
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor("#cccccc")
    .stroke();
  doc.moveDown(1);

  // ── Status Badge ──
  const statusColors: Record<string, string> = {
    DRAFT: "#f59e0b",
    APPROVED: "#3b82f6",
    RELEASED: "#8b5cf6",
    ACTIVE: "#22c55e",
    DEPRECATED: "#6b7280",
  };
  const statusLabels: Record<string, string> = {
    DRAFT: "مسودة",
    APPROVED: "معتمد",
    RELEASED: "مطلق",
    ACTIVE: "نشط",
    DEPRECATED: "متقاعد",
  };

  doc
    .font(fBold())
    .fontSize(12)
    .fillColor("#111111")
    .text(`الحالة:`, { align: "right", continued: true });
  doc
    .font(fRegular())
    .fontSize(12)
    .fillColor(statusColors[input.status] ?? "#111111")
    .text(` ${statusLabels[input.status] ?? input.status}`, { align: "right" });
  doc.moveDown(0.3);

  // ── Metadata Table ──
  const metaFontSize = 10;
  const labelColor = "#666666";
  const valueColor = "#111111";

  doc
    .font(fRegular())
    .fontSize(metaFontSize)
    .fillColor(labelColor)
    .text("رقم الإصدار:", { align: "right", continued: true });
  doc
    .fillColor(valueColor)
    .text(` v${input.versionNumber}`, { align: "right" });

  doc
    .fillColor(labelColor)
    .text("تاريخ الإنشاء:", { align: "right", continued: true });
  doc
    .fillColor(valueColor)
    .text(
      ` ${new Date(input.createdAt).toLocaleDateString("ar-SA")}`,
      { align: "right" },
    );

  if (input.activatedAt) {
    doc
      .fillColor(labelColor)
      .text("تاريخ التفعيل:", { align: "right", continued: true });
    doc
      .fillColor(valueColor)
      .text(
        ` ${new Date(input.activatedAt).toLocaleDateString("ar-SA")}`,
        { align: "right" },
      );
  }

  doc
    .fillColor(labelColor)
    .text("المرشّحات المرتبطة:", { align: "right", continued: true });
  doc
    .fillColor(valueColor)
    .text(` ${input.candidateCount}`, { align: "right" });

  doc
    .fillColor(labelColor)
    .text("المنشئ:", { align: "right", continued: true });
  doc
    .fillColor(valueColor)
    .text(` ${input.createdByName ?? "—"}`, { align: "right" });

  if (input.approvedByName) {
    doc
      .fillColor(labelColor)
      .text("المعتمد:", { align: "right", continued: true });
    doc
      .fillColor(valueColor)
      .text(` ${input.approvedByName}`, { align: "right" });
  }

  if (input.artifactPath) {
    doc
      .fillColor(labelColor)
      .text("مسار الحزمة:", { align: "right", continued: true });
    doc
      .fillColor(valueColor)
      .text(` ${input.artifactPath}`, { align: "right" });
  }

  doc.moveDown(1);

  // ── Notes ──
  if (input.notes) {
    doc
      .font(fBold())
      .fontSize(11)
      .fillColor("#111111")
      .text("ملاحظات:", { align: "right" });
    doc
      .font(fRegular())
      .fontSize(10)
      .fillColor("#444444")
      .text(input.notes, { align: "right" });
    doc.moveDown(1);
  }

  // ── Candidates ──
  if (input.candidateBindings && input.candidateBindings.length > 0) {
    doc
      .font(fBold())
      .fontSize(11)
      .fillColor("#111111")
      .text("المرشّحات المرتبطة:", { align: "right" });
    doc.moveDown(0.3);

    for (const c of input.candidateBindings) {
      doc
        .font(fRegular())
        .fontSize(9)
        .fillColor("#333333")
        .text(`• ${c.phrase}`, { align: "right", continued: true });
      doc
        .fontSize(8)
        .fillColor("#888888")
        .text(`  [${c.category}]`, { align: "right" });
    }
    doc.moveDown(1);
  }

  // ── Diffs ──
  if (input.diffsAsFrom && input.diffsAsFrom.length > 0) {
    doc
      .font(fBold())
      .fontSize(11)
      .fillColor("#111111")
      .text("الفروقات:", { align: "right" });
    doc.moveDown(0.3);

    for (const d of input.diffsAsFrom) {
      const tag = d.breakingChange ? " ⚠ تغيير جذري" : "";
      doc
        .font(fRegular())
        .fontSize(9)
        .fillColor("#333333")
        .text(
          `→ ${d.toVersion}  (خطورة: ${d.riskScore})${tag}`,
          { align: "right" },
        );
      if (d.summary) {
        doc
          .fontSize(8)
          .fillColor("#666666")
          .text(d.summary, { align: "right" });
      }
    }
    doc.moveDown(1);
  }

  // ── Releases ──
  if (input.releases && input.releases.length > 0) {
    doc
      .font(fBold())
      .fontSize(11)
      .fillColor("#111111")
      .text("الإطلاقات:", { align: "right" });
    doc.moveDown(0.3);

    for (const r of input.releases) {
      doc
        .font(fRegular())
        .fontSize(9)
        .fillColor("#333333")
        .text(
          `${new Date(r.createdAt).toLocaleDateString("ar-SA")} — ${r.createdByName ?? "—"}`,
          { align: "right" },
        );
      if (r.releaseNotes) {
        doc
          .fontSize(8)
          .fillColor("#666666")
          .text(r.releaseNotes, { align: "right" });
      }
    }
    doc.moveDown(1);
  }

  // ── Footer Disclaimer ──
  const footerY = Math.max(doc.y + 20, 700);
  doc
    .moveTo(50, footerY)
    .lineTo(545, footerY)
    .strokeColor("#cccccc")
    .stroke();
  doc.y = footerY + 5;
  doc
    .font(fRegular())
    .fontSize(7)
    .fillColor("#999999")
    .text(
      `تم التصدير من AQLIYA Knowledge Foundation — ${new Date().toLocaleDateString("ar-SA")}`,
      { align: "right" },
    );
  doc
    .fontSize(7)
    .fillColor("#999999")
    .text(
      "هذا المستند قابل للمراجعة وليس قرارًا نهائيًا. الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.",
      { align: "right" },
    );

  doc.end();
  await endPromise;

  const content = Buffer.concat(chunks);
  return {
    format: "pdf",
    filename: `knowledge-foundation-v${input.versionNumber}.pdf`,
    mimeType: "application/pdf",
    content,
  };
}

// ─── JSON Export ───

export async function buildKnowledgeFoundationJSON(
  input: KnowledgeFoundationExportInput,
): Promise<KnowledgeFoundationExportResult> {
  const payload = {
    exportedAt: new Date().toISOString(),
    system: "AQLIYA Knowledge Foundation",
    version: {
      id: input.versionId,
      versionNumber: input.versionNumber,
      status: input.status,
      notes: input.notes,
      candidateCount: input.candidateCount,
      artifactPath: input.artifactPath,
      createdByName: input.createdByName,
      approvedByName: input.approvedByName,
      activatedAt: input.activatedAt,
      createdAt: input.createdAt,
      rollbackVersionId: input.rollbackVersionId,
      releases: (input.releases ?? []).map((r) => ({
        id: r.id,
        releaseNotes: r.releaseNotes,
        createdAt: r.createdAt,
        createdByName: r.createdByName,
      })),
      diffsAsFrom: (input.diffsAsFrom ?? []).map((d) => ({
        toVersion: d.toVersion,
        riskScore: d.riskScore,
        breakingChange: d.breakingChange,
        summary: d.summary,
        generatedAt: d.generatedAt,
      })),
      candidateBindings: (input.candidateBindings ?? []).map((c) => ({
        phrase: c.phrase,
        canonicalCode: c.canonicalCode,
        category: c.category,
        confidence: c.confidence,
      })),
    },
  };

  const content = Buffer.from(JSON.stringify(payload, null, 2), "utf-8");
  return {
    format: "json",
    filename: `knowledge-foundation-v${input.versionNumber}.json`,
    mimeType: "application/json",
    content,
  };
}

// ─── Audit Helper ───

export async function recordExportAudit(input: {
  versionId: string;
  versionNumber: string;
  format: "pdf" | "json";
  actorId: string;
  actorName?: string;
  platformOrganizationId?: string;
}): Promise<void> {
  await writePlatformAuditLog(
    {
      productKey: "knowledge_foundation",
      action: "knowledge.foundation.exported",
      actorId: input.actorId,
      actorName: input.actorName,
      targetType: "KnowledgeFoundationVersion",
      targetId: input.versionId,
      targetLabel: `v${input.versionNumber}`,
      sourceSystem: "knowledge_foundation",
      severity: "info",
      status: "recorded",
      metadata: {
        versionNumber: input.versionNumber,
        exportFormat: input.format,
        exportedAt: new Date().toISOString(),
      },
    },
    { strict: false },
  );
}
