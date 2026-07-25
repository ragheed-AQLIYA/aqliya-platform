"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, RefreshCw } from "lucide-react";

export function OutreachCreateForm({
  loading,
  error,
  onCreate,
}: {
  loading: boolean;
  error: string | null;
  onCreate: (formData: FormData) => void;
}) {
  return (
    <form action={onCreate} className="space-y-3 border-t pt-4">
      <div className="space-y-1">
        <Label htmlFor="outreachSubject">الموضوع</Label>
        <Input
          id="outreachSubject"
          name="subject"
          required
          disabled={loading}
          placeholder="موضوع الرسالة"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="outreachBody">نص المسودة</Label>
        <Textarea
          id="outreachBody"
          name="body"
          required
          disabled={loading}
          rows={4}
          placeholder="نص outreach — لا يُرسل خارج المنصة"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="outreachChannel">القناة (اختياري)</Label>
        <select
          id="outreachChannel"
          name="channel"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          disabled={loading}
          defaultValue=""
        >
          <option value="">—</option>
          <option value="email">بريد</option>
          <option value="linkedin">LinkedIn</option>
          <option value="other">أخرى</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="submitForReview" value="1" />
        إرسال مباشرة لقائمة المراجعة (pending_review)
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="sm" disabled={loading} className="gap-1">
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        إنشاء مسودة
      </Button>
    </form>
  );
}
