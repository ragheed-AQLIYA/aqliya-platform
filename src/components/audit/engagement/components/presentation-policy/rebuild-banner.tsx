"use client";

import type { PresentationProfileRebuildResult } from "@/lib/audit/presentation/presentation-profile-rebuild-types";

interface RebuildBannerProps {
  fsRebuild: PresentationProfileRebuildResult;
}

export function RebuildBanner({ fsRebuild }: RebuildBannerProps) {
  if (fsRebuild.status === "rebuilt") {
    return (
      <p className="text-sm text-green-700" role="status">
        تم إعادة بناء القوائم بعد تغيير السياسة.
      </p>
    );
  }
  if (fsRebuild.status === "skipped_no_mappings") {
    return (
      <p className="text-sm text-amber-800" role="alert">
        تم حفظ السياسة. أعد بناء القوائم بعد إتمام ربط الحسابات.
      </p>
    );
  }
  return (
    <p className="text-sm text-destructive" role="alert">
      فشل إعادة البناء: {fsRebuild.errorMessage ?? "خطأ غير معروف"}
    </p>
  );
}
