"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EscalationFormProps {
  onSubmit: (level: string, reason: string) => void;
  onCancel: () => void;
}

export function EscalationForm({ onSubmit, onCancel }: EscalationFormProps) {
  const [reason, setReason] = useState("");
  const [level, setLevel] = useState("manager");

  return (
    <div className="mt-2 space-y-2 border rounded-md p-3">
      <Label>مستوى التصعيد</Label>
      <Select value={level} onValueChange={setLevel}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manager">مدير</SelectItem>
          <SelectItem value="partner">شريك</SelectItem>
          <SelectItem value="ethics">أخلاقيات</SelectItem>
          <SelectItem value="quality">جودة</SelectItem>
        </SelectContent>
      </Select>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="سبب التصعيد..."
        className="min-h-[60px]"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onSubmit(level, reason)}
          disabled={!reason.trim()}
        >
          تصعيد
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
