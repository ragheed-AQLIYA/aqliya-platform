"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { checkExportRestrictions } from "@/lib/localcontactos/compliance-service";
import PDFDocument from "pdfkit";
import { existsSync } from "node:fs";
import { buildExportMetadata } from "@/lib/platform/export";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Contact Export Actions]", message);
    return { ok: false, error: message };
  }
}

async function logAuditEvent(params: {
  contactId: string;
  organizationId: string;
  platformOrganizationId?: string | null;
  actorId: string;
  actorName?: string | null;
  action: string;
  details?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: params.platformOrganizationId,
        clientWorkspaceId: null,
        productKey: "localcontactos",
        actorId: params.actorId,
        actorName: params.actorName,
        actorEmail: null,
        action: params.action,
        targetType: "LocalContact",
        targetId: params.contactId,
        targetLabel: null,
        severity: "info",
        metadata: (params.metadata ?? {}) as any,
      },
    });
  } catch (e) {
    console.error("[Audit Log Error]", e);
  }
}

export async function requestContactExport(contactId: string, reason?: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: {
        id: true,
        organizationId: true,
        platformOrganizationId: true,
        sensitivityLevel: true,
        exportStatus: true,
      },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }
    if (contact.exportStatus === "requested") {
      throw new Error("Export already requested for this contact");
    }
    if (contact.exportStatus === "exported") {
      throw new Error("Contact has already been exported");
    }

    const restrictions = await checkExportRestrictions(contactId, user);

    const exportRequest = await prisma.contactExportRequest.create({
      data: {
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId,
        contactId,
        status: "pending",
        requestedById: user.id,
        requestedByName: user.name,
        reason: reason || null,
        requiresLegalReview: restrictions.requiresLegalReview,
        legalReviewStatus: restrictions.requiresLegalReview ? "pending" : "not_required",
      },
    });

    await prisma.localContact.update({
      where: { id: contactId },
      data: { exportStatus: "requested" },
    });

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "exportRequested",
      details: `Export requested by ${user.name}${reason ? `: ${reason}` : ""}`,
      metadata: { requestId: exportRequest.id, sensitivityLevel: contact.sensitivityLevel, requiresLegalReview: restrictions.requiresLegalReview },
    });

    revalidatePath(`/contacts/${contactId}`);
    return exportRequest;
  });
}

// ─── PDF Font Helpers ─────────────────────────────────────

const REGULAR_FONT_PATHS = [
  "C:/Windows/Fonts/arial.ttf",
  "/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  "/Library/Fonts/Arial Unicode.ttf",
];

const BOLD_FONT_PATHS = [
  "C:/Windows/Fonts/arialbd.ttf",
  "/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/Library/Fonts/Arial Bold.ttf",
];

function firstExistingPath(paths: string[]): string | null {
  return paths.find((p) => existsSync(p)) ?? null;
}

// ─── PDF Export Action ────────────────────────────────────

export async function exportContactAsPdf(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");

    const contact = await prisma.localContact.findFirst({
      where: { id: contactId, organizationId: user.organizationId },
      include: {
        outgoingRelations: {
          where: { isActive: true },
          include: { targetContact: { select: { id: true, name: true } } },
        },
        incomingRelations: {
          where: { isActive: true },
          include: { sourceContact: { select: { id: true, name: true } } },
        },
        interactions: { orderBy: { occurredAt: "desc" } },
        evidence: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!contact) {
      throw new Error("Contact not found or access denied");
    }

    const approvedRequest = await prisma.contactExportRequest.findFirst({
      where: { contactId, status: "approved" },
      orderBy: { createdAt: "desc" },
    });

    if (!approvedRequest) {
      throw new Error("يجب تقديم طلب تصدير والموافقة عليه أولاً");
    }

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Contact Export - ${contact.name}`,
        Author: "AQLIYA LocalContactOS",
        Subject: "Contact Profile Export",
        Creator: "AQLIYA LocalContactOS",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    const endPromise = new Promise<void>((resolve) => doc.on("end", () => resolve()));

    const regularPath = firstExistingPath(REGULAR_FONT_PATHS);
    const boldPath = firstExistingPath(BOLD_FONT_PATHS);

    if (regularPath) {
      doc.registerFont("ContactPdfRegular", regularPath);
    }
    if (boldPath) {
      doc.registerFont("ContactPdfBold", boldPath);
    }

    const rFont = regularPath ? "ContactPdfRegular" : "Helvetica";
    const bFont = boldPath ? "ContactPdfBold" : "Helvetica-Bold";
    const textOpts = { align: "right" as const, features: ["rtla"] as ("rtla" | "ltra")[] };

    doc.fontSize(18).font(bFont).text("LocalContactOS — تصدير جهة اتصال", textOpts);
    doc.moveDown(0.3);
    doc.fontSize(10).font(rFont).text(`تاريخ التصدير: ${new Date().toLocaleDateString("ar-SA")}`, textOpts);
    doc.text(`المصدر: ${user.name}`, textOpts);
    doc.moveDown(0.8);

    drawPdfDivider(doc, 50);
    doc.moveDown(0.6);

    doc.fontSize(14).font(bFont).text("معلومات الاتصال", textOpts);
    doc.moveDown(0.3);
    doc.fontSize(10).font(rFont);
    doc.text(`الاسم: ${contact.name}`, textOpts);
    if (contact.email) doc.text(`البريد الإلكتروني: ${contact.email}`, textOpts);
    if (contact.phone) doc.text(`رقم الهاتف: ${contact.phone}`, textOpts);
    if (contact.position) doc.text(`المسمى الوظيفي: ${contact.position}`, textOpts);
    if (contact.department) doc.text(`القسم: ${contact.department}`, textOpts);
    if (contact.organizationName) doc.text(`الجهة: ${contact.organizationName}`, textOpts);

    const sensitivityLabels: Record<string, string> = {
      normal: "عادي",
      sensitive: "حساس",
      confidential: "سري",
    };
    doc.text(`مستوى الحساسية: ${sensitivityLabels[contact.sensitivityLevel] || contact.sensitivityLevel}`, textOpts);
    doc.moveDown(0.6);

    const tags = typeof contact.tags === "string" ? JSON.parse(contact.tags) : contact.tags;
    if (Array.isArray(tags) && tags.length > 0) {
      doc.text(`الوسوم: ${(tags as string[]).join("، ")}`, textOpts);
      doc.moveDown(0.6);
    }

    if (contact.notes) {
      drawPdfDivider(doc, 50);
      doc.moveDown(0.4);
      doc.fontSize(12).font(bFont).text("ملاحظات", textOpts);
      doc.fontSize(10).font(rFont).text(contact.notes, textOpts);
      doc.moveDown(0.6);
    }

    const outgoingRelations = contact.outgoingRelations ?? [];
    const incomingRelations = contact.incomingRelations ?? [];
    if (outgoingRelations.length > 0 || incomingRelations.length > 0) {
      drawPdfDivider(doc, 50);
      doc.moveDown(0.4);
      doc.fontSize(14).font(bFont).text("العلاقات", textOpts);
      doc.moveDown(0.3);
      doc.fontSize(10).font(rFont);
      for (const rel of outgoingRelations) {
        const desc = rel.description ? ` — ${rel.description}` : "";
        doc.text(`${rel.relationType} ← ${rel.targetContact.name}${desc}`, textOpts);
      }
      for (const rel of incomingRelations) {
        const desc = rel.description ? ` — ${rel.description}` : "";
        doc.text(`${rel.sourceContact.name} → ${rel.relationType}${desc}`, textOpts);
      }
      doc.moveDown(0.6);
    }

    const interactions = contact.interactions ?? [];
    if (interactions.length > 0) {
      drawPdfDivider(doc, 50);
      doc.moveDown(0.4);
      doc.fontSize(14).font(bFont).text("التفاعلات", textOpts);
      doc.moveDown(0.3);
      doc.fontSize(9).font(rFont);
      const typeLabels: Record<string, string> = {
        meeting: "اجتماع", call: "مكالمة", email: "بريد إلكتروني",
        message: "رسالة", note: "ملاحظة", other: "أخرى",
      };
      for (const ix of interactions) {
        const label = typeLabels[ix.interactionType] || ix.interactionType;
        const date = new Date(ix.occurredAt).toLocaleDateString("ar-SA");
        doc.text(`${label} — ${date}${ix.subject ? ` — ${ix.subject}` : ""}`, textOpts);
        if (ix.summary) {
          doc.fontSize(8).text(ix.summary, { ...textOpts, indent: 20 });
          doc.fontSize(9);
        }
        doc.moveDown(0.2);
      }
      doc.moveDown(0.4);
    }

    const evidence = contact.evidence ?? [];
    if (evidence.length > 0) {
      drawPdfDivider(doc, 50);
      doc.moveDown(0.4);
      doc.fontSize(14).font(bFont).text("الأدلة والملفات", textOpts);
      doc.moveDown(0.3);
      doc.fontSize(9).font(rFont);
      for (const ev of evidence) {
        const desc = ev.description ? ` — ${ev.description}` : "";
        doc.text(`${ev.filename} (${ev.evidenceType})${desc}`, textOpts);
      }
      doc.moveDown(0.6);
    }

    drawPdfDivider(doc, 50);
    doc.moveDown(0.6);
    doc.fontSize(8).fillColor("#888888").font(rFont);
    doc.text("AI assists. Humans decide. Evidence governs.", textOpts);
    doc.text("AQLIYA LocalContactOS — تصدير محكوم", textOpts);

    const range = doc.bufferedPageRange();
    if (range && range.count > 0) {
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).fillColor("#888888").font(rFont);
        doc.text(`AQLIYA LocalContactOS — Page ${i + 1}`, 50, doc.page.height - 50, {
          align: "center",
          width: 495,
        });
      }
    }

    doc.end();
    await endPromise;

    const pdfBuffer = Buffer.concat(chunks);

    await prisma.$transaction([
      prisma.contactExportRequest.update({
        where: { id: approvedRequest.id },
        data: { exportedAt: new Date() },
      }),
      prisma.localContact.update({
        where: { id: contactId },
        data: { exportStatus: "exported" },
      }),
    ]);

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "exportDownloaded",
      details: `PDF exported by ${user.name}`,
      metadata: { format: "pdf", sizeBytes: pdfBuffer.length },
    });

    revalidatePath(`/contacts/${contactId}`);

    const safeName = contact.name.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_");
    return {
      content: pdfBuffer.toString("base64"),
      filename: `contact_${safeName}.pdf`,
      sizeBytes: pdfBuffer.length,
    };
  });
}

function drawPdfDivider(doc: PDFKit.PDFDocument, x: number) {
  doc.moveTo(x, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").stroke();
}

export async function approveContactExport(contactId: string, note?: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const request = await prisma.contactExportRequest.findFirst({
      where: { contactId, status: "pending" },
      orderBy: { createdAt: "desc" },
    });
    if (!request) {
      throw new Error("No pending export request found");
    }
    if (request.requiresLegalReview && request.legalReviewStatus !== "cleared") {
      throw new Error("Export requires legal review clearance first");
    }

    const [updatedRequest] = await prisma.$transaction([
      prisma.contactExportRequest.update({
        where: { id: request.id },
        data: {
          status: "approved",
          reviewedById: user.id,
          reviewedByName: user.name,
          reviewNote: note || null,
          reviewedAt: new Date(),
        },
      }),
      prisma.localContact.update({
        where: { id: contactId },
        data: { exportStatus: "approved" },
      }),
    ]);

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "exportApproved",
      details: `Export approved by ${user.name}${note ? `: ${note}` : ""}`,
      metadata: { requestId: updatedRequest.id },
    });

    revalidatePath(`/contacts/${contactId}`);
    return updatedRequest;
  });
}

export async function rejectContactExport(contactId: string, reason: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const request = await prisma.contactExportRequest.findFirst({
      where: { contactId, status: "pending" },
      orderBy: { createdAt: "desc" },
    });
    if (!request) {
      throw new Error("No pending export request found");
    }

    if (!reason) {
      throw new Error("Rejection reason is required");
    }

    const [updatedRequest] = await prisma.$transaction([
      prisma.contactExportRequest.update({
        where: { id: request.id },
        data: {
          status: "rejected",
          reviewedById: user.id,
          reviewedByName: user.name,
          reviewNote: reason,
          reviewedAt: new Date(),
        },
      }),
      prisma.localContact.update({
        where: { id: contactId },
        data: { exportStatus: "rejected" },
      }),
    ]);

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "exportRejected",
      details: `Export rejected by ${user.name}: ${reason}`,
      metadata: { requestId: updatedRequest.id },
    });

    revalidatePath(`/contacts/${contactId}`);
    return updatedRequest;
  });
}

export async function recordExportDownload(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true, exportStatus: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    if (contact.exportStatus !== "approved") {
      throw new Error("Export not approved for this contact");
    }

    await prisma.localContact.update({
      where: { id: contactId },
      data: { exportStatus: "exported" },
    });

    await prisma.contactExportRequest.updateMany({
      where: { contactId, status: "approved" },
      data: { exportedAt: new Date() },
    });

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "exportDownloaded",
      details: `Export downloaded by ${user.name}`,
    });

    revalidatePath(`/contacts/${contactId}`);
    return { ok: true, data: { downloaded: true } };
  });
}

export async function getExportStatus(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, exportStatus: true, sensitivityLevel: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const latestRequest = await prisma.contactExportRequest.findFirst({
      where: { contactId },
      orderBy: { createdAt: "desc" },
    });

    return {
      exportStatus: contact.exportStatus,
      sensitivityLevel: contact.sensitivityLevel,
      request: latestRequest,
    };
  });
}

export async function getExportRequests(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const requests = await prisma.contactExportRequest.findMany({
      where: { organizationId: user.organizationId, contactId },
      orderBy: { createdAt: "desc" },
    });
    return requests;
  });
}

export async function clearLegalReview(contactId: string, cleared: boolean, note?: string) {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const request = await prisma.contactExportRequest.findFirst({
      where: { contactId, status: "pending", requiresLegalReview: true },
      orderBy: { createdAt: "desc" },
    });
    if (!request) {
      throw new Error("No pending export request requiring legal review found");
    }

    const updated = await prisma.contactExportRequest.update({
      where: { id: request.id },
      data: {
        legalReviewStatus: cleared ? "cleared" : "blocked",
        reviewNote: note || null,
      },
    });

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "complianceOverride",
      details: `Legal review ${cleared ? "cleared" : "blocked"} by ${user.name}${note ? `: ${note}` : ""}`,
      metadata: { requestId: updated.id, cleared },
    });

    revalidatePath(`/contacts/${contactId}`);
    return updated;
  });
}

export async function updateContactSensitivityLevel(contactId: string, sensitivityLevel: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true, sensitivityLevel: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }
    if (!["normal", "sensitive", "confidential"].includes(sensitivityLevel)) {
      throw new Error("Invalid sensitivity level");
    }

    const oldLevel = contact.sensitivityLevel;
    const updated = await prisma.localContact.update({
      where: { id: contactId },
      data: { sensitivityLevel },
    });

    if (oldLevel !== sensitivityLevel) {
      await logAuditEvent({
        contactId,
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId,
        actorId: user.id,
        actorName: user.name,
        action: "sensitivityLevelChanged",
        details: `Sensitivity changed from ${oldLevel} to ${sensitivityLevel} by ${user.name}`,
        metadata: { from: oldLevel, to: sensitivityLevel },
      });
    }

    revalidatePath(`/contacts/${contactId}`);
    return updated;
  });
}
