"use client";

import { usePathname } from "next/navigation";
import { WorkflowGuard } from "@/components/audit/layout/workflow-guard";

const UNGUARDED_TABS = new Set(["overview", "audit-trail", "pilot"]);

interface EngagementWorkflowShellProps {
  engagementId: string;
  children: React.ReactNode;
}

export function EngagementWorkflowShell({
  engagementId,
  children,
}: EngagementWorkflowShellProps) {
  const pathname = usePathname();
  const base = `/audit/engagements/${engagementId}`;

  if (!pathname || pathname === base) {
    return <>{children}</>;
  }

  if (!pathname.startsWith(`${base}/`)) {
    return <>{children}</>;
  }

  const tabKey = pathname.slice(base.length + 1).split("/")[0];
  if (!tabKey || UNGUARDED_TABS.has(tabKey)) {
    return <>{children}</>;
  }

  return (
    <WorkflowGuard engagementId={engagementId} tabKey={tabKey}>
      {children}
    </WorkflowGuard>
  );
}
