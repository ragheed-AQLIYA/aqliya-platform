"use client";

import Link from "next/link";

export function FormActions({
  loading,
  selectedCount,
}: {
  loading: boolean;
  selectedCount: number;
}) {
  return (
    <div className="flex gap-3">
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "جاري الإنشاء..." : `إنشاء الإصدار (${selectedCount} مرشّح)`}
      </button>
      <Link
        href="/knowledge-foundation"
        className="rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/50"
      >
        إلغاء
      </Link>
    </div>
  );
}
