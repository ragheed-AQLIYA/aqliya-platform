"use client";

import { Badge } from "@/components/ui/badge";
import type { RiskFlag } from "@/actions/contact-actions";

const TYPE_LABELS: Record<string, string> = {
  compliance: "امتثال",
  data_privacy: "خصوصية بيانات",
  relationship: "علاقة",
  contractual: "تعاقدي",
  financial: "مالي",
  other: "أخرى",
};

interface ResolvedFlagsSectionProps {
  flags: RiskFlag[];
}

export function ResolvedFlagsSection({ flags }: ResolvedFlagsSectionProps) {
  if (flags.length === 0) return null;

  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-medium">
        تم الحل ({flags.length})
      </summary>
      <div className="mt-2 space-y-2">
        {flags.map((flag) => (
          <div key={flag.id} className="border rounded-lg p-2 opacity-60">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {TYPE_LABELS[flag.type] || flag.type}
              </Badge>
              <span className="text-xs text-muted-foreground">{flag.description}</span>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
