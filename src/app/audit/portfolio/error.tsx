"use client";

import { Button } from "@/components/ui/button";

export default function AuditPortfolioError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8" dir="rtl">
      <h2 className="text-lg font-semibold">خطأ في محفظة التدقيق</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        تعذر تحميل بيانات المحفظة. حاول مرة أخرى.
      </p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </div>
  );
}
