"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditPolicyFormProps {
  editRevenueExcl: string;
  onEditRevenueExclChange: (value: string) => void;
  editCorExcl: string;
  onEditCorExclChange: (value: string) => void;
  editCorPrefix: string;
  onEditCorPrefixChange: (value: string) => void;
  editOtherNet: string;
  onEditOtherNetChange: (value: string) => void;
  editFinanceOffset: string;
  onEditFinanceOffsetChange: (value: string) => void;
  pending: boolean;
  onSave: () => void;
}

export function EditPolicyForm({
  editRevenueExcl,
  onEditRevenueExclChange,
  editCorExcl,
  onEditCorExclChange,
  editCorPrefix,
  onEditCorPrefixChange,
  editOtherNet,
  onEditOtherNetChange,
  editFinanceOffset,
  onEditFinanceOffsetChange,
  pending,
  onSave,
}: EditPolicyFormProps) {
  return (
    <div className="border-t pt-4 space-y-3 text-sm">
      <p className="font-medium">تحرير السياسة المخصصة</p>
      <div className="grid gap-2">
        <Label>استثناءات الإيراد (GL)</Label>
        <Input
          value={editRevenueExcl}
          onChange={(e) => onEditRevenueExclChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
      <div className="grid gap-2">
        <Label>استثناءات CoR (GL)</Label>
        <Input
          value={editCorExcl}
          onChange={(e) => onEditCorExclChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
      <div className="grid gap-2">
        <Label>بادئات CoR المستثناة</Label>
        <Input
          value={editCorPrefix}
          onChange={(e) => onEditCorPrefixChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>هدف صافي الدخل الآخر</Label>
          <Input
            value={editOtherNet}
            onChange={(e) => onEditOtherNetChange(e.target.value)}
          />
        </div>
        <div>
          <Label>تسوية التمويل</Label>
          <Input
            value={editFinanceOffset}
            onChange={(e) => onEditFinanceOffsetChange(e.target.value)}
          />
        </div>
      </div>
      <Button type="button" size="sm" disabled={pending} onClick={onSave}>
        حفظ التعديلات وتطبيق
      </Button>
    </div>
  );
}
