"use client";

import { Badge } from "@/components/ui/badge";
import type { OrgMemory } from "../types";
import { EmptySection } from "./empty-section";

export function OrgMemoryTable({ memories }: { memories: OrgMemory[] }) {
  if (memories.length === 0) {
    return (
      <EmptySection
        title="لا توجد ذاكرة تنظيمية"
        description="لم يتم تسجيل أي قرارات تجاوز بعد. ستظهر هنا بعد مراجعة النتائج الخاطئة."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">الرمز / Code</th>
            <th className="pb-2 font-medium">الحساب / Account</th>
            <th className="pb-2 font-medium">النتيجة السابقة</th>
            <th className="pb-2 font-medium">تجاوز يدوي</th>
            <th className="pb-2 font-medium">السبب / Reason</th>
          </tr>
        </thead>
        <tbody>
          {memories.map((m, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-2">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">{m.workbookLineCode}</code>
              </td>
              <td className="py-2">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">{m.accountCode}</code>{" "}
                {m.accountName}
              </td>
              <td className="py-2">
                <Badge
                  variant={
                    m.previousResult === "matched"
                      ? "default"
                      : m.previousResult === "overridden"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {m.previousResult === "matched"
                    ? "مطابق"
                    : m.previousResult === "overridden"
                      ? "مستبعد"
                      : m.previousResult}
                </Badge>
              </td>
              <td className="py-2">
                {m.manualOverride ? (
                  <Badge variant="outline" className="text-xs">
                    نعم
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
              <td className="py-2 text-muted-foreground text-xs max-w-[200px] truncate">
                {m.overrideReason ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
