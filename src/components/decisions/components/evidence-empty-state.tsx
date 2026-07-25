"use client";

export function EvidenceEmptyState() {
  return (
    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">لا توجد أدلة مرفقة بعد</p>
      <p className="mt-1">
        أضف عقودًا، عروضًا، ملفات تحليل، أو مراسلات داعمة قبل إرسال القرار
        للمراجعة.
      </p>
    </div>
  );
}
