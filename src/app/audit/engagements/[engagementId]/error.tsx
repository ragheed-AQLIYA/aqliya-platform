"use client";

import { clientLogger } from "@/lib/observability/client-logger";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuditErrorCard } from "@/components/audit/error/audit-error-card";

export default function EngagementError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    clientLogger.error("[Engagement Error Boundary]", error);
  }, [error]);

  const router = useRouter();
  const params = useParams();
  const engagementId = params?.engagementId as string | undefined;

  return (
    <AuditErrorCard
      title="خطأ في التكليف"
      message="تعذر تحميل هذا التكليف بأمان. لم تُحذف بيانات التدقيق — يمكنك إعادة المحاولة أو العودة إلى لوحة AuditOS."
      onRetry={reset}
      onBack={() =>
        router.push(
          engagementId ? `/audit/engagements/${engagementId}` : "/audit",
        )
      }
      variant="page"
    />
  );
}
