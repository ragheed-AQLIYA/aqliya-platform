"use client";

import { Settings, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { OrganizationSettingsButton } from "../organization-settings";

interface OrganizationActionsProps {
  orgId?: string;
  name: string;
  platformOrgId: string;
}

export function OrganizationActions({
  orgId,
  name,
  platformOrgId,
}: OrganizationActionsProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">إجراءات المؤسسة</h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/sunbul/admin"
          className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4" />
          إدارة سنبل
        </Link>
        <Link
          href="/sunbul"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          فتح سنبل
        </Link>
        {orgId && (
          <OrganizationSettingsButton
            orgId={orgId}
            currentName={name}
            platformOrgId={platformOrgId}
          />
        )}
        <button
          disabled
          className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
          title="قيد التطوير"
        >
          <Users className="h-4 w-4" />
          إدارة الموظفين
        </button>
      </div>
    </section>
  );
}
