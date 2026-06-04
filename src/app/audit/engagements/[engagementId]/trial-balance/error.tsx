"use client";

import { AuditWorkflowTabError } from "@/components/audit/layout/audit-workflow-tab-error";

export default function TrialBalanceError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AuditWorkflowTabError {...props} tabTitleAr="ميزان المراجعة" />;
}
