"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PresentationPolicySummary } from "@/lib/audit/presentation/presentation-policy-service";

interface PolicySelectorProps {
  policies: PresentationPolicySummary[];
  policyId: string;
  onPolicyChange: (id: string) => void;
  dirtyAssign: boolean;
  pending: boolean;
  onAssign: () => void;
}

export function PolicySelector({
  policies,
  policyId,
  onPolicyChange,
  dirtyAssign,
  pending,
  onAssign,
}: PolicySelectorProps) {
  return (
    <>
      <div className="grid gap-2 max-w-md">
        <Label htmlFor="presentation-policy-select">السياسة المرتبطة</Label>
        <Select value={policyId} onValueChange={onPolicyChange}>
          <SelectTrigger id="presentation-policy-select">
            <SelectValue placeholder="اختر سياسة" />
          </SelectTrigger>
          <SelectContent>
            {policies.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
                {p.isSystem ? " (نظام)" : " (مخصصة)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <Button
          type="button"
          size="sm"
          disabled={!dirtyAssign || pending}
          onClick={onAssign}
        >
          {pending ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : null}
          تعيين السياسة وإعادة البناء
        </Button>
      </div>
    </>
  );
}
