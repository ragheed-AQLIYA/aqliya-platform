"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";

interface RiskFlagFormProps {
  type: string;
  severity: string;
  description: string;
  loading: string | null;
  onTypeChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export function RiskFlagForm({
  type,
  severity,
  description,
  loading,
  onTypeChange,
  onSeverityChange,
  onDescriptionChange,
  onAdd,
  onCancel,
}: RiskFlagFormProps) {
  return (
    <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
      <div>
        <label className="text-xs font-medium">النوع</label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
        >
          <option value="compliance">امتثال</option>
          <option value="data_privacy">خصوصية بيانات</option>
          <option value="relationship">علاقة</option>
          <option value="contractual">تعاقدي</option>
          <option value="financial">مالي</option>
          <option value="other">أخرى</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium">الخطورة</label>
        <select
          value={severity}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
        >
          <option value="low">منخفض</option>
          <option value="medium">متوسط</option>
          <option value="high">عالي</option>
          <option value="critical">خطير</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium">الوصف</label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="وصف خطر..."
          rows={2}
          className="mt-1 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onAdd}
          disabled={loading === "add" || !description.trim()}
          size="sm"
        >
          {loading === "add" ? (
            <Loader2 className="ml-1 h-3 w-3 animate-spin" />
          ) : (
            <Plus className="ml-1 h-3 w-3" />
          )}
          إضافة
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
