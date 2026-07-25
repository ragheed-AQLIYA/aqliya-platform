"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";
import type { RiskFlag } from "@/actions/contact-actions";

const TYPE_LABELS: Record<string, string> = {
  compliance: "امتثال",
  data_privacy: "خصوصية بيانات",
  relationship: "علاقة",
  contractual: "تعاقدي",
  financial: "مالي",
  other: "أخرى",
};

const SEVERITY_LABELS: Record<string, { label: string; className: string }> = {
  low: { label: "منخفض", className: "bg-green-100 text-green-800" },
  medium: { label: "متوسط", className: "bg-amber-100 text-amber-800" },
  high: { label: "عالي", className: "bg-orange-100 text-orange-800" },
  critical: { label: "خطير", className: "bg-red-100 text-red-800" },
};

interface ActiveFlagCardProps {
  flag: RiskFlag;
  loading: string | null;
  onResolve: (flagId: string) => void;
}

export function ActiveFlagCard({ flag, loading, onResolve }: ActiveFlagCardProps) {
  return (
    <div className="border rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-2">
        <Badge className={SEVERITY_LABELS[flag.severity]?.className || ""}>
          {SEVERITY_LABELS[flag.severity]?.label || flag.severity}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {TYPE_LABELS[flag.type] || flag.type}
        </Badge>
      </div>
      <p className="text-sm">{flag.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {flag.createdBy} • {new Date(flag.createdAt).toLocaleDateString("ar-SA")}
        </span>
        <Button
          onClick={() => onResolve(flag.id)}
          disabled={loading === `resolve-${flag.id}`}
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700"
        >
          {loading === `resolve-${flag.id}` ? (
            <Loader2 className="h-3 w-3 animate-spin ml-1" />
          ) : (
            <CheckCircle className="h-3 w-3 ml-1" />
          )}
          حل
        </Button>
      </div>
    </div>
  );
}
