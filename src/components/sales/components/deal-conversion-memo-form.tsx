"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, XCircle } from "lucide-react";
import type { ConversionMemo } from "@/lib/sales/conversion-memo";
import type { SalesEvidenceLinkView } from "@/lib/sales/evidence-links";

export function MemoForm({
  memo,
  evidenceLinks,
  loading,
  error,
  handleSave,
}: {
  memo: ConversionMemo | null;
  evidenceLinks: SalesEvidenceLinkView[];
  loading: boolean;
  error: string | null;
  handleSave: (formData: FormData) => Promise<void>;
}) {
  const selectedRefs = new Set(memo?.evidenceRefs ?? []);

  return (
    <form action={handleSave} className="space-y-4">
      <div>
        <Label htmlFor="conversionDraft">مسودة المذكرة (pilot → paid)</Label>
        <Textarea
          id="conversionDraft"
          name="draft"
          required
          rows={5}
          defaultValue={memo?.draft ?? ""}
          placeholder="ملخص نتائج الـ pilot، قرار التحول، والخطوات التالية — بدون إرسال بريد أو LLM"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="pilotCriteria">معايير نجاح الـ pilot</Label>
        <Textarea
          id="pilotCriteria"
          name="pilotCriteria"
          required
          rows={3}
          defaultValue={memo?.pilotCriteria ?? ""}
          placeholder="معايير قابلة للتحقق مرتبطة بالأدلة المربوطة"
          className="mt-1"
        />
      </div>

      <div>
        <Label>مراجع الأدلة (مطلوبة عند الإرسال)</Label>
        {evidenceLinks.length === 0 ? (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            اربط دليلاً واحداً على الأقل في لوحة الأدلة قبل إرسال المذكرة.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {evidenceLinks.map((link) => (
              <li key={link.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="evidenceRefs"
                  value={link.id}
                  defaultChecked={selectedRefs.has(link.id)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">{link.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {link.evidenceId}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <Button type="submit" size="sm" disabled={loading} className="gap-1">
        <FileText className="h-4 w-4" />
        {loading ? "جارٍ الحفظ..." : "حفظ المسودة"}
      </Button>
    </form>
  );
}
