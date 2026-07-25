"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientLogger } from "@/lib/observability/client-logger";
import { AuditErrorCard } from "@/components/audit/error/audit-error-card";

interface AuditWorkflowTabErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  tabTitleAr: string;
}

export function AuditWorkflowTabError({
  error,
  reset,
  tabTitleAr,
}: AuditWorkflowTabErrorProps) {
  const clientLogger = createClientLogger("AuditWorkflowTabError");

  useEffect(() => {
    clientLogger.error(`AuditOS ${tabTitleAr} Error`, error);
  }, [error, tabTitleAr, clientLogger]);

  const router = useRouter();
  const params = useParams();
  const engagementId = params?.engagementId as string | undefined;

  return (
    <AuditErrorCard
      title={`خطأ في ${tabTitleAr}`}
      message="تعذر تحميل هذا القسم بأمان. لم تُحذف بيانات التدقيق — يمكنك إعادة المحاولة أو العودة إلى نظرة عامة للتكليف."
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
