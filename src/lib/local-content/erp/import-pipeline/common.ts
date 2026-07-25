import "server-only";

import { prisma } from "@/lib/prisma";
import type { SpendRecordInputFromErp } from "../field-mapping";
import type { RecordIssue } from "../types";

export const PRODUCT_KEY = "local-content-os";

export interface ImportOptions {
  organizationId: string;
  connectionId: string;
  projectId?: string;
  since?: Date;
  actorId?: string;
  actorName?: string;
  autoApprove?: boolean;
}

export async function findOrCreateSupplier(
  organizationId: string,
  projectId: string,
  mapped: SpendRecordInputFromErp,
): Promise<string | null> {
  if (mapped.supplierRegistrationNumber) {
    const existing = await prisma.localContentSupplier.findFirst({
      where: {
        projectId,
        crNumber: mapped.supplierRegistrationNumber,
      },
      select: { id: true },
    });
    if (existing) return existing.id;
  }

  const existing = await prisma.localContentSupplier.findFirst({
    where: {
      projectId,
      name: mapped.supplierName,
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  return null;
}

export async function createSupplierFromErp(
  projectId: string,
  mapped: SpendRecordInputFromErp,
  organizationId: string,
  actorId?: string,
): Promise<string> {
  const supplier = await prisma.localContentSupplier.create({
    data: {
      projectId,
      name: mapped.supplierName,
      crNumber: mapped.supplierRegistrationNumber ?? null,
      localityClassification: "unclassified",
      createdById: actorId ?? null,
    },
  });
  return supplier.id;
}

export function validateMappedRecord(
  mapped: SpendRecordInputFromErp,
  rowIndex: number,
): RecordIssue[] {
  const issues: RecordIssue[] = [];

  if (!mapped.supplierName.trim()) {
    issues.push({
      rowNumber: rowIndex,
      field: "supplierName",
      issue: "اسم المورد مطلوب",
      severity: "error",
    });
  }

  if (mapped.amount <= 0) {
    issues.push({
      rowNumber: rowIndex,
      field: "amount",
      issue: "المبلغ يجب أن يكون أكبر من صفر",
      severity: "error",
    });
  }

  if (mapped.amount > 50_000_000) {
    issues.push({
      rowNumber: rowIndex,
      field: "amount",
      issue: `المبلغ (${mapped.amount}) يتجاوز حد 50,000,000 ريال`,
      severity: "warning",
    });
  }

  if (!mapped.period.trim()) {
    issues.push({
      rowNumber: rowIndex,
      field: "period",
      issue: "الفترة مطلوبة",
      severity: "error",
    });
  }

  if (!mapped.category.trim()) {
    issues.push({
      rowNumber: rowIndex,
      field: "category",
      issue: "التصنيف مطلوب",
      severity: "error",
    });
  }

  return issues;
}
