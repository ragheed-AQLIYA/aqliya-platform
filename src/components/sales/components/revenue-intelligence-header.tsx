"use client";

export function RevenueIntelligenceHeader({ disclaimerAr }: { disclaimerAr: string }) {
  return (
    <div>
      <h1 className="text-h2 font-black">ذكاء الإيرادات</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        مسار، توقع مرجّح، تغطية، ومخاطر — من بيانات الفرص والتفاعلات
      </p>
      <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">{disclaimerAr}</p>
    </div>
  );
}
