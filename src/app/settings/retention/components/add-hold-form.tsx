"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  type: string;
  id: string;
  reason: string;
  onTypeChange: (v: string) => void;
  onIdChange: (v: string) => void;
  onReasonChange: (v: string) => void;
  onAdd: () => void;
};

export function AddHoldForm({
  type,
  id,
  reason,
  onTypeChange,
  onIdChange,
  onReasonChange,
  onAdd,
}: Props) {
  return (
    <div className="p-4 rounded-md border mb-4 space-y-3">
      <h3 className="text-sm font-medium">إضافة تعليق جديد</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">نوع السجل</Label>
          <Input
            placeholder="مثال: PlatformAuditLog"
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">معرف السجل</Label>
          <Input
            placeholder="معرف السجل"
            value={id}
            onChange={(e) => onIdChange(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">السبب</Label>
          <Input
            placeholder="سبب التعليق"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
          />
        </div>
      </div>
      <Button
        size="sm"
        onClick={onAdd}
        disabled={!type || !id || !reason}
      >
        إضافة تعليق
      </Button>
    </div>
  );
}
