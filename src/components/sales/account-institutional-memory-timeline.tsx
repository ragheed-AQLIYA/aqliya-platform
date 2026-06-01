import { Badge } from "@/components/ui/badge";
import {
  institutionalMemoryTypeLabelAr,
  type InstitutionalMemoryEntry,
} from "@/lib/sales/institutional-memory";
import { History } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  audit: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  review_decision:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  icp_review:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

function formatAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function AccountInstitutionalMemoryTimeline({
  entries,
}: {
  entries: InstitutionalMemoryEntry[];
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        لا توجد مدخلات ذاكرة مؤسسية بعد — تُضاف تلقائياً بعد قرارات المراجعة أو
        مراجعة ICP.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li
          key={entry.sourceRef}
          className="rounded-md border border-border/60 bg-muted/20 p-3"
        >
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={TYPE_COLORS[entry.type] ?? TYPE_COLORS.audit}
            >
              {institutionalMemoryTypeLabelAr(entry.type)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatAt(entry.at)}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{entry.summary}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            مرجع: {entry.sourceRef}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function AccountInstitutionalMemoryCard({
  entries,
}: {
  entries: InstitutionalMemoryEntry[];
}) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <History className="h-3.5 w-3.5" />
        للقراءة فقط — سجل مؤسسي مُلحَق من التدقيق والحوكمة ومراجعة ICP
      </p>
      <AccountInstitutionalMemoryTimeline entries={entries} />
    </div>
  );
}
