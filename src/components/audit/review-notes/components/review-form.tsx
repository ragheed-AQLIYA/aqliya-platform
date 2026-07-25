"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReviewFormProps {
  onSubmit: (conclusion: string, comment: string) => void;
  onCancel: () => void;
}

export function ReviewForm({ onSubmit, onCancel }: ReviewFormProps) {
  const [conclusion, setConclusion] = useState("satisfactory");
  const [comment, setComment] = useState("");

  return (
    <div className="mt-2 space-y-2 border rounded-md p-3">
      <Label>القرار</Label>
      <Select value={conclusion} onValueChange={setConclusion}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="satisfactory">مقبول - إغلاق</SelectItem>
          <SelectItem value="needs_revision">يحتاج مراجعة</SelectItem>
          <SelectItem value="re_open">إعادة فتح</SelectItem>
        </SelectContent>
      </Select>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="تعليق المراجعة..."
        className="min-h-[60px]"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSubmit(conclusion, comment)}>
          تأكيد
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
