"use client";

export function FormFields({
  versionNumber,
  onVersionNumberChange,
  notes,
  onNotesChange,
}: {
  versionNumber: string;
  onVersionNumberChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}) {
  return (
    <>
      <div>
        <label
          htmlFor="versionNumber"
          className="mb-1 block text-sm font-medium"
        >
          رقم الإصدار <span className="text-red-500">*</span>
        </label>
        <input
          id="versionNumber"
          type="text"
          value={versionNumber}
          onChange={(e) => onVersionNumberChange(e.target.value)}
          placeholder="مثال: 1.0.0"
          className="w-full rounded-lg border bg-background p-2 text-sm"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          استخدم التنسيق الدلالي: رئيسي.فرعي.تصحيحي
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">
          ملاحظات
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="وصف موجز لمحتوى هذا الإصدار..."
          className="w-full rounded-lg border bg-background p-2 text-sm"
          rows={3}
        />
      </div>
    </>
  );
}
