import PDFDocument from "pdfkit";

interface CaseData {
  title: string;
  id: string;
  clientName: string;
  status: string;
  description?: string | null;
  createdAt: Date;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  archivedAt?: Date | null;
}

interface DocItem {
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

interface ReviewItem {
  status: string;
  notes?: string | null;
  reviewerId: string;
  createdAt: Date;
}

interface AuditItem {
  action: string;
  actorId: string;
  entityType: string;
  createdAt: Date;
}

interface PdfInput {
  labels: Record<string, string>;
  caseData: CaseData;
  documents: DocItem[];
  reviews: ReviewItem[];
  auditEvents: AuditItem[];
}

const statusLabels: Record<string, string> = {
  Draft: "مسودة",
  UnderReview: "تحت المراجعة",
  Approved: "معتمد",
  Archived: "مؤرشف",
};

const actionLabels: Record<string, string> = {
  RECORD_CREATED: "إنشاء القضية",
  RECORD_UPDATED: "تحديث القضية",
  RECORD_SUBMITTED: "إرسال للمراجعة",
  RECORD_APPROVED: "اعتماد القضية",
  RECORD_RETURNED: "إرجاع القضية",
  RECORD_ARCHIVED: "أرشفة القضية",
  REVIEW_CREATED: "إضافة مراجعة",
  DOCUMENT_CREATED: "إضافة مستند",
};

function formatKB(bytes: number): string {
  if (bytes === 0) return "—";
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function addSectionTitle(doc: typeof PDFDocument.prototype, text: string) {
  doc.fontSize(11).font("Helvetica-Bold").fillColor("#1a1a1a");
  doc.text(text, { underline: true });
  doc.moveDown(0.3);
}

function addBodyText(doc: typeof PDFDocument.prototype, text: string) {
  doc.fontSize(9).font("Helvetica").fillColor("#333");
  doc.text(text);
  doc.moveDown(0.2);
}

function addEmptyLine(doc: typeof PDFDocument.prototype, text: string) {
  doc.fontSize(9).font("Helvetica").fillColor("#999");
  doc.text(text);
  doc.moveDown(0.2);
}

export async function generateSunbulPdf(input: PdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
      info: {
        Title: input.labels.reportTitle,
        Author: "Sunbul — AQLIYA",
        Subject: input.caseData.title,
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const L = input.labels;

    // ─── Header ────────────────────────────────────────
    doc.fontSize(16).font("Helvetica-Bold").fillColor("#1a1a1a");
    doc.text(`${L.platform} — ${L.reportTitle}`, { align: "right" });
    doc.moveDown(0.2);
    doc.fontSize(8).font("Helvetica").fillColor("#666");
    doc.text(L.exportDate, { align: "right" });
    doc.moveDown(0.5);

    // Separator
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#ddd").stroke();
    doc.moveDown(0.5);

    // ─── Case Information ──────────────────────────────
    addSectionTitle(doc, L.caseInfo);
    addBodyText(doc, `${input.caseData.title}`);
    addBodyText(doc, `ID: ${input.caseData.id.substring(0, 12)}...`);
    addBodyText(
      doc,
      `${L.status}: ${statusLabels[input.caseData.status] ?? input.caseData.status}`,
    );
    addBodyText(doc, `${L.clientInfo}: ${input.caseData.clientName}`);
    addBodyText(doc, `تاريخ الإنشاء: ${formatDate(input.caseData.createdAt)}`);
    if (input.caseData.submittedAt)
      addBodyText(
        doc,
        `تاريخ الإرسال: ${formatDate(input.caseData.submittedAt)}`,
      );
    if (input.caseData.approvedAt)
      addBodyText(
        doc,
        `تاريخ الاعتماد: ${formatDate(input.caseData.approvedAt)}`,
      );
    if (input.caseData.archivedAt)
      addBodyText(
        doc,
        `تاريخ الأرشفة: ${formatDate(input.caseData.archivedAt)}`,
      );
    doc.moveDown(0.3);

    // ─── Description ───────────────────────────────────
    addSectionTitle(doc, L.description);
    if (input.caseData.description) {
      addBodyText(doc, input.caseData.description);
    } else {
      addEmptyLine(doc, L.noDescription);
    }
    doc.moveDown(0.3);

    // ─── Documents ─────────────────────────────────────
    addSectionTitle(doc, L.documents);
    if (input.documents.length === 0) {
      addEmptyLine(doc, L.noDocuments);
    } else {
      for (const d of input.documents) {
        doc.fontSize(8).font("Helvetica").fillColor("#333");
        doc.text(
          `${d.fileName}  |  ${d.fileType.split("/").pop()}  |  ${formatKB(d.fileSize)}  |  ${formatDate(d.createdAt)}`,
          {
            indent: 10,
          },
        );
        doc.moveDown(0.1);
      }
    }
    doc.moveDown(0.3);

    // ─── Reviews ───────────────────────────────────────
    addSectionTitle(doc, L.reviews);
    if (input.reviews.length === 0) {
      addEmptyLine(doc, L.noReviews);
    } else {
      for (const r of input.reviews) {
        const revStatus =
          r.status === "Returned"
            ? "إرجاع"
            : r.status === "Approved"
              ? "اعتماد"
              : r.status;
        doc.fontSize(8).font("Helvetica-Bold").fillColor("#333");
        doc.text(`${revStatus}  —  ${formatDate(r.createdAt)}`, { indent: 10 });
        if (r.notes) {
          doc.fontSize(8).font("Helvetica").fillColor("#555");
          doc.text(`  ${r.notes}`, { indent: 15 });
        }
        doc.moveDown(0.1);
      }
    }
    doc.moveDown(0.3);

    // ─── Audit Trail ──────────────────────────────────
    addSectionTitle(doc, L.auditTrail);
    if (input.auditEvents.length === 0) {
      addEmptyLine(doc, L.noAudit);
    } else {
      for (const e of input.auditEvents) {
        const aLabel = actionLabels[e.action] ?? e.action;
        doc.fontSize(8).font("Helvetica").fillColor("#333");
        doc.text(`${aLabel}  |  ${formatDate(e.createdAt)}`, { indent: 10 });
        doc.moveDown(0.05);
      }
    }
    doc.moveDown(0.5);

    // ─── Governance Disclaimer ─────────────────────────
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#ddd").stroke();
    doc.moveDown(0.4);
    addSectionTitle(doc, L.governanceTitle);
    doc.fontSize(8).font("Helvetica-Oblique").fillColor("#888");
    doc.text(L.governanceBody, { align: "right" });
    doc.moveDown(0.3);

    // Footer
    doc.fontSize(7).font("Helvetica").fillColor("#aaa");
    doc.text(`Sunbul — AQLIYA  |  ${L.exportDate}  |  ${L.reportTitle}`, {
      align: "center",
    });

    doc.end();
  });
}
