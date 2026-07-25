"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { RevenueNote } from "@/lib/sales/vnext/revenue-intelligence";

export function RevenueNotesCard({ notes }: { notes: RevenueNote[] }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>ملاحظات الإيرادات (مسودة)</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        <ul className="space-y-2 text-sm">
          {notes.map((note) => (
            <li
              key={note.id}
              className={`rounded border px-3 py-2 ${
                note.kind === "caution"
                  ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                  : note.kind === "recommendation"
                    ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                    : ""
              }`}
            >
              {note.textAr}
            </li>
          ))}
        </ul>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
