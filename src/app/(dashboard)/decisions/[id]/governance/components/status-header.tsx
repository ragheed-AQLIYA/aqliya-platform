"use client";

import { Badge } from "@/components/ui/badge";

function getStatusVariant(status: string) {
  switch (status) {
    case "DRAFT":
      return "secondary";
    case "IN_REVIEW":
      return "default";
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "ARCHIVED":
      return "outline";
    default:
      return "secondary";
  }
}

interface StatusHeaderProps {
  status: string;
}

export function StatusHeader({ status }: StatusHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold">الحوكمة والاعتماد</h2>
        <p className="text-sm text-muted-foreground">
          مراجعة واعتماد وتدقيق دورة حياة القرار.
        </p>
      </div>
      <Badge variant={getStatusVariant(status)}>
        {status.replace("_", " ")}
      </Badge>
    </div>
  );
}
