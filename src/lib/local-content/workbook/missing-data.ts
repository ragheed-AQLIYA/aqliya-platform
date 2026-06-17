// ─── LocalContentOS Workbook — Missing Data Collection Engine ───
// Detects missing workbook fields, groups by category,
// generates client-facing collection packages with evidence requirements.

import { prisma } from "@/lib/prisma";
import { getTemplateLineByCode } from "./template";
import type {
  MissingDataDetectionResult,
  MissingDataItemView,
  MissingCategoryGroup,
  DataRequestWithItems,
} from "./types";
import { WORKBOOK_TEMPLATE } from "./template";

/**
 * Detect missing data in a workbook.
 * Scans all lines and identifies fields that need client input.
 */
export async function detectMissingData(
  workbookId: string,
): Promise<MissingDataDetectionResult> {
  const lines = await prisma.lcWorkbookLine.findMany({
    where: { workbookId },
    orderBy: [{ section: "asc" }, { displayOrder: "asc" }],
  });

  const items: MissingDataItemView[] = [];

  for (const line of lines) {
    // Check if value is missing
    const hasAutoValue = line.autoFilled && line.autoFillValue !== null;
    const hasManualValue = line.manualValue !== null;

    if (!hasAutoValue && !hasManualValue) {
      // Missing financial value
      items.push({
        lineCode: line.code,
        lineName: line.name,
        section: line.section,
        fieldName: "manualValue",
        category: "financial_data",
        label: `قيمة: ${line.name}`,
        description: `يرجى توفير القيمة المالية للبند ${line.code}: ${line.name}`,
        evidenceRequired: false,
        evidenceTypes: [],
      });
    }

    // Check evidence requirements
    if (line.evidenceRequired && !hasManualValue && !hasAutoValue) {
      let evidenceTypes: string[] = [];
      try {
        if (line.evidenceTypes) {
          evidenceTypes = JSON.parse(line.evidenceTypes);
        }
      } catch {
        evidenceTypes = [];
      }

      items.push({
        lineCode: line.code,
        lineName: line.name,
        section: line.section,
        fieldName: "evidence_file",
        category: "evidence",
        label: `مستند إثبات: ${line.name}`,
        description: `يرجى توفير المستندات الداعمة للبند ${line.code}: ${line.name}. أنواع المستندات المطلوبة: ${evidenceTypes.join("، ")}`,
        evidenceRequired: true,
        evidenceTypes,
      });
    }

    // Check notes
    const tmpl = getTemplateLineByCode(line.code);
    if (
      tmpl &&
      !hasAutoValue &&
      !hasManualValue &&
      line.section === "declarations"
    ) {
      items.push({
        lineCode: line.code,
        lineName: line.name,
        section: line.section,
        fieldName: "notes",
        category: "narrative",
        label: `إيضاح: ${line.name}`,
        description: tmpl.description || `يرجى تقديم إيضاح للبند ${line.code}`,
        evidenceRequired: false,
        evidenceTypes: [],
      });
    }
  }

  // Group by category
  const byCategory: Record<string, MissingCategoryGroup> = {};
  for (const item of items) {
    if (!byCategory[item.category]) {
      const categoryLabels: Record<string, string> = {
        financial_data: "بيانات مالية",
        evidence: "مستندات الإثبات",
        classification: "تصنيف",
        narrative: "إيضاحات",
      };
      byCategory[item.category] = {
        category: item.category,
        count: 0,
        label: categoryLabels[item.category] || item.category,
        items: [],
      };
    }
    byCategory[item.category].count++;
    byCategory[item.category].items.push(item);
  }

  return {
    workbookId,
    totalMissing: items.length,
    byCategory,
    items,
  };
}

/**
 * Generate a client-facing data request package.
 * Creates a structured LcDataRequest with all detected missing items.
 */
export async function generateDataRequest(
  workbookId: string,
): Promise<DataRequestWithItems> {
  const workbook = await prisma.lcWorkbook.findUnique({
    where: { id: workbookId },
    include: { project: true },
  });

  if (!workbook) {
    throw new Error(`Workbook not found: ${workbookId}`);
  }

  const detection = await detectMissingData(workbookId);

  // Create the data request
  const request = await prisma.lcDataRequest.create({
    data: {
      workbookId,
      title: `طلب بيانات - ${workbook.title}`,
      description: `طلب البيانات الناقصة لتعبئة workbook المحتوى المحلي. إجمالي ${detection.totalMissing} عنصر مطلوب.`,
      status: "draft",
    },
  });

  // Get the populated workbook lines to link items
  const lines = await prisma.lcWorkbookLine.findMany({
    where: { workbookId },
  });
  const lineMap = new Map(lines.map((l) => [l.code, l]));

  // Create individual request items
  const itemData = detection.items
    .filter((item) => {
      // Only include items that still need data
      const line = lineMap.get(item.lineCode);
      if (!line) return true;
      if (item.fieldName === "manualValue") {
        return line.manualValue === null && !(line.autoFilled && line.autoFillValue !== null);
      }
      if (item.fieldName === "evidence_file") {
        // Check if evidence already exists for this line
        return line.manualValue === null && !(line.autoFilled && line.autoFillValue !== null);
      }
      return true;
    })
    .map((item) => {
      const line = lineMap.get(item.lineCode);
      return {
        requestId: request.id,
        lineId: line?.id || null,
        fieldName: item.fieldName,
        category: item.category,
        label: item.label,
        description: item.description,
        evidenceRequired: item.evidenceRequired,
        evidenceTypes:
          item.evidenceTypes.length > 0
            ? JSON.stringify(item.evidenceTypes)
            : null,
        status: "open" as const,
      };
    });

  if (itemData.length > 0) {
    await prisma.lcDataRequestItem.createMany({ data: itemData });
  }

  // Return the full request with items
  return (await prisma.lcDataRequest.findUnique({
    where: { id: request.id },
    include: { items: true },
  })) as DataRequestWithItems;
}

/**
 * Get data requests for a workbook.
 */
export async function getWorkbookDataRequests(
  workbookId: string,
): Promise<DataRequestWithItems[]> {
  return (await prisma.lcDataRequest.findMany({
    where: { workbookId },
    include: { items: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  })) as DataRequestWithItems[];
}

/**
 * Mark a data request item as fulfilled.
 */
export async function fulfillDataRequestItem(
  itemId: string,
  responseValue: string,
): Promise<void> {
  await prisma.lcDataRequestItem.update({
    where: { id: itemId },
    data: {
      status: "fulfilled",
      responseValue,
      updatedAt: new Date(),
    },
  });
}

/**
 * Mark a data request item as waived.
 */
export async function waiveDataRequestItem(itemId: string): Promise<void> {
  await prisma.lcDataRequestItem.update({
    where: { id: itemId },
    data: {
      status: "waived",
      updatedAt: new Date(),
    },
  });
}

/**
 * Send a data request (mark as sent).
 */
export async function sendDataRequest(requestId: string): Promise<void> {
  await prisma.lcDataRequest.update({
    where: { id: requestId },
    data: {
      status: "sent",
      sentAt: new Date(),
    },
  });
}

/**
 * Get a clean client-facing text of the data request.
 * This can be used to generate emails, PDFs, or API responses.
 */
export async function getClientDataRequestText(
  requestId: string,
): Promise<string> {
  const request = await prisma.lcDataRequest.findUnique({
    where: { id: requestId },
    include: {
      items: { orderBy: [{ category: "asc" }, { createdAt: "asc" }] },
      workbook: { include: { project: true } },
    },
  });

  if (!request) return "Request not found.";

  const lines: string[] = [
    `طلب بيانات المحتوى المحلي`,
    `========================`,
    `المشروع: ${request.workbook.project?.name || "N/A"}`,
    `الفترة: ${request.workbook.reportingPeriod}`,
    `تاريخ الطلب: ${request.createdAt.toLocaleDateString("ar-SA")}`,
    ``,
    request.description || "",
    ``,
    `العناصر المطلوبة:`,
    `-----------------`,
  ];

  // Group by category for display
  const groups: Record<string, typeof request.items> = {};
  for (const item of request.items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }

  const categoryLabels: Record<string, string> = {
    financial_data: "📊 بيانات مالية",
    evidence: "📎 مستندات إثبات",
    classification: "🏷️ تصنيف",
    narrative: "📝 إيضاحات",
  };

  for (const [category, items] of Object.entries(groups)) {
    lines.push(``);
    lines.push(categoryLabels[category] || category);
    lines.push(`  ${items.length} عنصر`);
    for (const item of items) {
      lines.push(`  - ${item.label}`);
      if (item.description) lines.push(`    ${item.description}`);
      if (item.evidenceRequired) {
        let types: string[] = [];
        try {
          if (item.evidenceTypes) types = JSON.parse(item.evidenceTypes);
        } catch {
          types = [];
        }
        if (types.length > 0) {
          lines.push(`    المستندات المطلوبة: ${types.join(", ")}`);
        }
      }
    }
  }

  lines.push(``);
  lines.push(`---`);
  lines.push(`منصة عقلية - نظام المحتوى المحلي`);
  lines.push(`AQLIYA LocalContentOS`);

  return lines.join("\n");
}
