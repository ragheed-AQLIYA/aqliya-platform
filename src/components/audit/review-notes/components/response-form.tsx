"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResponseFormProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export function ResponseForm({ onSubmit, onCancel }: ResponseFormProps) {
  const [text, setText] = useState("");

  return (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="اكتب ردك على الملاحظة..."
        className="min-h-[60px]"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSubmit(text)} disabled={!text.trim()}>
          <Send className="ml-1 h-3 w-3" />
          إرسال الرد
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
