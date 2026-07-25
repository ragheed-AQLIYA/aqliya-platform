"use client";

import type { VersionData } from "../version-detail-client";

interface Props {
  version: VersionData;
  loading: string | null;
  isAdmin: boolean;
  isOperator: boolean;
  isActive: boolean;
  onApprove: () => void;
  onRelease: () => void;
  onActivate: () => void;
  onDeprecate: () => void;
}

export function VersionQuickActions({
  version,
  loading,
  isAdmin,
  isOperator,
  isActive,
  onApprove,
  onRelease,
  onActivate,
  onDeprecate,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {version.status === "DRAFT" && isAdmin && (
        <button
          onClick={onApprove}
          disabled={loading !== null}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading === "اعتماد" ? "جاري..." : "اعتماد الإصدار"}
        </button>
      )}

      {version.status === "APPROVED" && isOperator && (
        <button
          onClick={onRelease}
          disabled={loading !== null}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading === "إطلاق" ? "جاري..." : "إطلاق الحزمة"}
        </button>
      )}

      {version.status === "RELEASED" && isAdmin && (
        <button
          onClick={onActivate}
          disabled={loading !== null}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading === "تفعيل" ? "جاري..." : "تفعيل الإصدار"}
        </button>
      )}

      {isActive && isAdmin && (
        <button
          onClick={onDeprecate}
          disabled={loading !== null}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading === "إيقاف" ? "جاري..." : "إيقاف الإصدار"}
        </button>
      )}
    </div>
  );
}
