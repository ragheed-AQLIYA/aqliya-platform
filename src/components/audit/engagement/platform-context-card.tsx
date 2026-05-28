// ─── Platform Context Card ───
// Read-only display of ClientWorkspace, Project, and PlatformOrganization
// context for the current AuditOS engagement.
// Does not block the page if context is missing.

import { getProjectByEngagementId } from "@/lib/platform/project-context";
import { getClientWorkspaceById } from "@/lib/platform/client-workspace-context";
import { getPlatformOrganizationById } from "@/lib/platform/platform-organization-context";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Shield, Layers, Building2, AlertTriangle } from "lucide-react";

export async function PlatformContextCard({
  engagementId,
}: {
  engagementId: string;
}) {
  let project = null;
  let workspace = null;
  let platformOrg = null;
  const errors: string[] = [];
  let engagementNotLinkedOnly = false;
  const t = await getTranslations("audit.engagement");

  try {
    project = await getProjectByEngagementId(engagementId);
    workspace = await getClientWorkspaceById(project.workspaceId);
    platformOrg = await getPlatformOrganizationById(
      workspace.platformOrganizationId,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("errors.unknown");
    if (msg.includes("AuditEngagement")) {
      errors.push(t("errors.engagementNotLinked"));
      engagementNotLinkedOnly = true;
    } else if (msg.includes("ClientWorkspace")) {
      errors.push(t("errors.workspaceNotFound"));
    } else if (msg.includes("PlatformOrganization")) {
      errors.push(t("errors.platformOrgNotFound"));
    } else {
      errors.push(msg);
    }
  }

  // If no context at all, render nothing
  if (!project && errors.length === 0) {
    return null;
  }

  const hasFullContext = project && workspace && platformOrg;
  const hasWarning = errors.length > 0 && !engagementNotLinkedOnly;
  const showPilotContextNote = engagementNotLinkedOnly && !hasFullContext;

  return (
    <div
      className={`rounded-md border p-3 text-xs ${
        showPilotContextNote
          ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
          : hasWarning
            ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
            : hasFullContext
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
              : "border-muted bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Shield className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium text-muted-foreground">سياق المنصة</span>
        {hasWarning && (
          <AlertTriangle className="h-3 w-3 text-yellow-600 mr-auto" />
        )}
      </div>

      {showPilotContextNote && (
        <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
          {t("errors.engagementNotLinked")}{" "}
          <span className="text-blue-700/80 dark:text-blue-400/80">
            {t("errors.engagementNotLinkedHint")}
          </span>
        </p>
      )}

      {hasWarning && (
        <div className="space-y-1 mb-2">
          {errors.map((err, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-yellow-700 dark:text-yellow-300"
            >
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        {workspace && (
          <div className="flex items-center gap-2">
            <Layers className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">مساحة العمل:</span>
            <span className="font-medium">{workspace.name}</span>
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
              {workspace.workspaceType}
            </Badge>
            <Badge
              variant={workspace.status === "active" ? "secondary" : "outline"}
              className="text-[10px] h-4 px-1.5"
            >
              {workspace.status}
            </Badge>
          </div>
        )}

        {project && (
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">المشروع:</span>
            <span className="font-medium">{project.name}</span>
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
              {project.projectType}
            </Badge>
          </div>
        )}

        {platformOrg && (
          <div className="flex items-center gap-2">
            <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">المنظمة:</span>
            <span className="font-medium">{platformOrg.name}</span>
            <span className="text-muted-foreground">({platformOrg.slug})</span>
          </div>
        )}
      </div>
    </div>
  );
}
