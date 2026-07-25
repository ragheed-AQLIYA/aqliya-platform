"use client";

import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Policy } from "./types";
import { getModelLabel } from "./utils";

type Props = {
  policy: Policy;
  editDays: number;
  editAction: "delete" | "archive" | "anonymize";
  editEnabled: boolean;
  onSave: (modelName: string) => void;
  onCancel: () => void;
  onDaysChange: (days: number) => void;
  onActionChange: (action: "delete" | "archive" | "anonymize") => void;
  onEnabledChange: (enabled: boolean) => void;
};

export function PolicyEditForm({
  policy,
  editDays,
  editAction,
  editEnabled,
  onSave,
  onCancel,
  onDaysChange,
  onActionChange,
  onEnabledChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-4 w-4" />
        <span className="font-medium">{getModelLabel(policy.modelName)}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">مدة الاحتفاظ (أيام)</Label>
          <Input
            type="number"
            min={0}
            value={editDays}
            onChange={(e) => onDaysChange(Number(e.target.value))}
          />
        </div>
        <div>
          <Label className="text-xs">الإجراء</Label>
          <Select
            value={editAction}
            onValueChange={(v) =>
              onActionChange(v as "delete" | "archive" | "anonymize")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delete">حذف</SelectItem>
              <SelectItem value="archive">أرشفة</SelectItem>
              <SelectItem value="anonymize">إخفاء الهوية</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">الحالة</Label>
          <Select
            value={editEnabled ? "enabled" : "disabled"}
            onValueChange={(v) => onEnabledChange(v === "enabled")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enabled">مفعل</SelectItem>
              <SelectItem value="disabled">معطل</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(policy.modelName)}>
          حفظ
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
