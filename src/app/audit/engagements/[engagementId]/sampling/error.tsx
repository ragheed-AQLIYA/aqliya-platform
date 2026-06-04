"use client";

import { AuditWorkflowTabError } from "@/components/audit/layout/audit-workflow-tab-error";

export default function SamplingError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AuditWorkflowTabError {...props} tabTitleAr="العينات" />;
}
