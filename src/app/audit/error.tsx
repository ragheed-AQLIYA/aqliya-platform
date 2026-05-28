"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuditErrorCard } from "@/components/audit/error/audit-error-card";

export default function AuditError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AuditOS Error Boundary]", error);
  }, [error]);

  const router = useRouter();

  return (
    <AuditErrorCard
      title="خطأ في مساحة AuditOS"
      message={
        process.env.NODE_ENV === "development"
          ? `${error.message} (أعد التحميل للمحاولة)`
          : "حدث خطأ في مساحة AuditOS. تعذر تحميل بيانات سير العمل بأمان — لم تُحذف بيانات التدقيق."
      }
      onRetry={reset}
      onBack={() => router.push("/audit")}
      variant="page"
    />
  );
}
