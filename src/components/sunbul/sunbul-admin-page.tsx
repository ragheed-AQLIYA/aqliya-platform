"use client";

import { useState } from "react";
import { WorkspaceStatus } from "@/components/workspace/workspace-status";
import { SunbulClientList } from "@/components/sunbul/sunbul-client-list";
import { SunbulMembershipManager } from "@/components/sunbul/sunbul-membership-manager";
import { Settings } from "lucide-react";

export function SunbulAdminPage() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <WorkspaceStatus
        module="platform"
        status="healthy"
        message="إدارة سنبل — إنشاء العملاء وإدارة العضويات"
      />

      <div className="flex items-center gap-3">
        <Settings className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-h2 font-black text-foreground">إدارة سنبل</h1>
          <p className="text-body-sm text-muted-foreground">
            إدارة العملاء والعضويات في نظام سير العمل
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SunbulClientList
          onSelectClient={setSelectedClientId}
          onChange={() => setRefreshKey((k) => k + 1)}
        />
        <SunbulMembershipManager clientId={selectedClientId} />
      </div>
    </div>
  );
}
