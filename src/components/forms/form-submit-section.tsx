"use client";

import type { FormStatus } from "./constants";

export function FormSubmitSection({
  status,
  onMailtoFallback,
}: {
  status: FormStatus;
  onMailtoFallback: () => void;
}) {
  return (
    <div className="mt-8">
      {status === "error" && (
        <div
          className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm"
          role="alert"
        >
          تعذر الإرسال مؤقتًا.{" "}
          <button
            type="button"
            onClick={onMailtoFallback}
            className="font-medium underline"
          >
            اضغط هنا للإرسال عبر البريد الإلكتروني
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-primary h-12 w-full text-base disabled:opacity-60 disabled:hover:scale-100"
      >
        {status === "submitting"
          ? "جاري الإرسال..."
          : "إرسال طلب تصميم النظام"}
      </button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        بالضغط على إرسال، أنت توافق على تواصل فريق عقلية معك بخصوص هذا الطلب.
      </p>
    </div>
  );
}
