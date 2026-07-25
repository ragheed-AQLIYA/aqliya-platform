"use client";

import { Badge } from "@/components/ui/badge";

interface EvidenceHeaderProps {
  count: number;
}

export function EvidenceHeader({ count }: EvidenceHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">المستندات والأدلة</h2>
        <p className="text-xs text-muted-foreground">
          أدلة دعم القرار للمراجعة البشرية وليست اعتمادًا نهائيًا بحد ذاتها.
        </p>
      </div>
      <Badge variant="outline">{count}</Badge>
    </div>
  );
}
