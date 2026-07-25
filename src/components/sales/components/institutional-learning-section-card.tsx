"use client";

import { type ReactNode } from "react";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { cn } from "@/lib/utils";
import { institutionalLearningRowElementId } from "@/lib/sales/vnext/institutional-learning-links";
import { InstitutionalLearningEvidenceList } from "./institutional-learning-evidence-list";

export function rowFocusClass(
  focusRowId: string | null | undefined,
  rowId: string,
) {
  return cn(
    "rounded-lg border border-border/60 p-3",
    focusRowId === rowId &&
      "border-primary/60 bg-primary/5 ring-1 ring-primary/30",
  );
}

interface InstitutionalLearningSectionCardProps<T extends { id: string }> {
  title: string;
  items: T[];
  focusRowId?: string | null;
  evidenceMap: Record<string, string[]>;
  renderItem: (item: T) => ReactNode;
}

export function InstitutionalLearningSectionCard<
  T extends { id: string },
>({
  title,
  items,
  focusRowId,
  evidenceMap,
  renderItem,
}: InstitutionalLearningSectionCardProps<T>) {
  if (items.length === 0) return null;

  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>{title}</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        <ul className="space-y-3 text-sm">
          {items.map((row) => (
            <li
              key={row.id}
              id={institutionalLearningRowElementId(row.id)}
              className={rowFocusClass(focusRowId, row.id)}
            >
              {renderItem(row)}
              <InstitutionalLearningEvidenceList
                entityId={row.id}
                evidenceMap={evidenceMap}
              />
            </li>
          ))}
        </ul>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
