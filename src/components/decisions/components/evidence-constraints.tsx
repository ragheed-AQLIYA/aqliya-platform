"use client";

import { Badge } from "@/components/ui/badge";

export function EvidenceConstraints() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
      <Badge variant="outline">حتى 50 مستندًا</Badge>
      <Badge variant="outline">الحد الأقصى 20MB</Badge>
      <Badge variant="outline">PDF / Office / صور / CSV / TXT</Badge>
    </div>
  );
}
