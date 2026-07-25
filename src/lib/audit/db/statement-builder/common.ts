import {
  type PresentationLineKind,
  getPresentationPeriodAmount,
} from "@/lib/audit/db/income-statement-presentation";

export type MappingWithCanonical = {
  id: string;
  engagementId: string;
  sourceAccountId: string;
  sourceAccountCode: string;
  sourceAccountName: string;
  debitAmount: number;
  creditAmount: number;
  canonicalAccountId: string | null;
  canonicalAccount: {
    id: string;
    code: string;
    name: string;
    category: string;
    statementType: string;
    displayOrder: number;
  } | null;
  confidence: number | null;
  mappingType: string;
  status: string;
  statementClassification: string | null;
  mappedBy: string | null;
  mappedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const BALANCE_SHEET_CLASSIFICATIONS = new Set([
  "Current Assets",
  "Non-Current Assets",
  "Current Liabilities",
  "Non-Current Liabilities",
  "Equity",
]);

export function withInferredClassification(
  mapping: MappingWithCanonical,
): MappingWithCanonical {
  if (mapping.statementClassification || !mapping.canonicalAccount) {
    return mapping;
  }
  const { category, statementType } = mapping.canonicalAccount;
  if (
    statementType === "balance_sheet" &&
    BALANCE_SHEET_CLASSIFICATIONS.has(category)
  ) {
    return { ...mapping, statementClassification: category };
  }
  return mapping;
}

export function getMappingDisplayAmount(mapping: MappingWithCanonical): number {
  const category =
    mapping.statementClassification ?? mapping.canonicalAccount?.category ?? "";
  const statementType = mapping.canonicalAccount?.statementType ?? "";
  if (statementType === "income_statement") {
    return mapping.creditAmount !== 0
      ? mapping.creditAmount
      : mapping.debitAmount;
  }
  const isAssetCategory =
    category === "Current Assets" || category === "Non-Current Assets";
  if (isAssetCategory) {
    return mapping.debitAmount !== 0
      ? mapping.debitAmount
      : -mapping.creditAmount;
  }
  return mapping.creditAmount !== 0
    ? mapping.creditAmount
    : -mapping.debitAmount;
}

export function sorted(items: MappingWithCanonical[]): MappingWithCanonical[] {
  return [...items].sort(
    (a, b) =>
      (a.canonicalAccount?.displayOrder ?? 0) -
      (b.canonicalAccount?.displayOrder ?? 0),
  );
}

export function sum(items: MappingWithCanonical[]): number {
  return items.reduce((total, item) => total + getMappingDisplayAmount(item), 0);
}

export function ids(items: MappingWithCanonical[]): string[] {
  return items.map((item) => item.id);
}

export function getPresentationAmountForKind(
  mapping: MappingWithCanonical,
  kind: PresentationLineKind,
): number {
  return getPresentationPeriodAmount(mapping, kind);
}

export function makeLine(
  statementId: string,
  label: string,
  amount: number,
  displayOrder: number,
  linkedAccountMappings: string[],
  opts?: { isTotal?: boolean; indentLevel?: number },
) {
  return {
    id: `${statementId}-line-${displayOrder}`,
    statementId,
    label,
    amount,
    isTotal: opts?.isTotal ?? true,
    indentLevel: opts?.indentLevel ?? 0,
    displayOrder,
    linkedAccountMappings,
  };
}

export function pushTotalAndDetailLines(
  lines: ReturnType<typeof makeLine>[],
  statementId: string,
  sectionLabel: string,
  sectionAmount: number,
  mappings: MappingWithCanonical[],
  kind: PresentationLineKind,
  ref: { displayOrder: number },
  opts?: { labelFn?: (m: MappingWithCanonical) => string },
) {
  lines.push(makeLine(statementId, sectionLabel, sectionAmount, ref.displayOrder, ids(mappings)));
  ref.displayOrder += 1;
  for (const mapping of sorted(mappings)) {
    const label = opts?.labelFn
      ? opts.labelFn(mapping)
      : `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`;
    lines.push(
      makeLine(statementId, label, getPresentationAmountForKind(mapping, kind), ref.displayOrder, [mapping.id], { isTotal: false, indentLevel: 1 }),
    );
    ref.displayOrder += 1;
  }
}

export function pushSimpleTotalAndDetailLines(
  lines: ReturnType<typeof makeLine>[],
  statementId: string,
  sectionLabel: string,
  sectionAmount: number,
  mappings: MappingWithCanonical[],
  ref: { displayOrder: number },
  opts?: { labelFn?: (m: MappingWithCanonical) => string },
) {
  lines.push(makeLine(statementId, sectionLabel, sectionAmount, ref.displayOrder, ids(mappings)));
  ref.displayOrder += 1;
  for (const mapping of sorted(mappings)) {
    const label = opts?.labelFn
      ? opts.labelFn(mapping)
      : `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`;
    lines.push(
      makeLine(statementId, label, getMappingDisplayAmount(mapping), ref.displayOrder, [mapping.id], { isTotal: false, indentLevel: 1 }),
    );
    ref.displayOrder += 1;
  }
}
