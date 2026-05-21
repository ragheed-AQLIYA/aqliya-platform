import { getCurrentUser } from "@/lib/auth";
import { getPlatformOrganizationByLegacyOrganizationId } from "@/lib/platform/platform-organization-context";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "default" | "success" | "warning" | "destructive";
}) {
  const colors: Record<string, string> = {
    default: "",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant]}`}
    >
      {label}
    </span>
  );
}

export default async function WorkspacesPage() {
  const user = await getCurrentUser();

  let platformOrgId: string | null = null;

  try {
    const ctx = await getPlatformOrganizationByLegacyOrganizationId(
      user.organizationId,
    );
    platformOrgId = ctx.platformOrganizationId;
  } catch {
    // Session without platform org
  }

  // ─── Fetch workspaces and linked data ───

  const workspaces = platformOrgId
    ? await prisma.clientWorkspace.findMany({
        where: { platformOrganizationId: platformOrgId },
        include: {
          _count: { select: { projects: true, auditClients: true } },
          auditClients: {
            select: { id: true, name: true },
          },
          projects: {
            include: {
              _count: { select: { auditEngagements: true } },
              auditEngagements: {
                select: { id: true, fiscalPeriod: true },
                take: 5,
              },
            },
          },
        },
        orderBy: { name: "asc" },
      })
    : [];

  // ─── Stats ───

  const auditClientsTotal = await prisma.auditClient.count();
  const auditClientsLinked = await prisma.auditClient.count({
    where: { clientWorkspaceId: { not: null } },
  });
  const engagementsTotal = await prisma.auditEngagement.count();
  const engagementsLinked = await prisma.auditEngagement.count({
    where: { projectId: { not: null } },
  });
  const projectsTotal = await prisma.project.count();
  const workspaceTotal = await prisma.clientWorkspace.count();

  // ─── Orphan checks ───

  const auditClientsUnlinked = auditClientsTotal - auditClientsLinked;
  const engagementsUnlinked = engagementsTotal - engagementsLinked;

  return (
    <main className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">ClientWorkspaces &amp; Projects</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        This page is for workspace/project linkage verification only. It shows
        workspaces and projects within your PlatformOrganization.
      </p>

      {/* Summary Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-md border text-center">
              <p className="text-2xl font-bold">{workspaceTotal}</p>
              <p className="text-xs text-muted-foreground">Workspaces</p>
            </div>
            <div className="p-3 rounded-md border text-center">
              <p className="text-2xl font-bold">{projectsTotal}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div className="p-3 rounded-md border text-center">
              <p className="text-2xl font-bold">
                {auditClientsLinked}/{auditClientsTotal}
              </p>
              <p className="text-xs text-muted-foreground">
                AuditClients linked
              </p>
            </div>
            <div className="p-3 rounded-md border text-center">
              <p className="text-2xl font-bold">
                {engagementsLinked}/{engagementsTotal}
              </p>
              <p className="text-xs text-muted-foreground">
                Engagements linked
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {(auditClientsUnlinked > 0 || engagementsUnlinked > 0) && (
        <Card className="mb-6 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Linkage Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {auditClientsUnlinked > 0 && (
                <li className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    {auditClientsUnlinked} AuditClient(s) without a
                    ClientWorkspace
                  </span>
                </li>
              )}
              {engagementsUnlinked > 0 && (
                <li className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    {engagementsUnlinked} AuditEngagement(s) without a Project
                  </span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Workspace List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Workspaces</CardTitle>
          <CardDescription>
            ClientWorkspaces within your organization ({workspaces.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No workspaces found.
            </p>
          ) : (
            <div className="space-y-4">
              {workspaces.map((ws) => (
                <div key={ws.id} className="p-4 rounded-md border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{ws.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {ws.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={ws.workspaceType}
                        variant={
                          ws.workspaceType === "client" ? "default" : "warning"
                        }
                      />
                      {ws.status === "active" ? (
                        <StatusBadge label="Active" variant="success" />
                      ) : (
                        <StatusBadge label={ws.status} variant="warning" />
                      )}
                    </div>
                  </div>

                  {/* Linked AuditClients */}
                  {ws.auditClients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">
                        Linked AuditClients:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {ws.auditClients.map((ac) => (
                          <span
                            key={ac.id}
                            className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px]"
                          >
                            {ac.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects within workspace */}
                  {ws.projects.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium">
                        Projects ({ws._count.projects}):
                      </p>
                      {ws.projects.map((p) => (
                        <div key={p.id} className="p-2 rounded bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{p.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({p.projectType})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge
                                label={p.status}
                                variant={
                                  p.status === "active" ? "success" : "warning"
                                }
                              />
                            </div>
                          </div>
                          {/* Linked engagements */}
                          {p.auditEngagements.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {p.auditEngagements.map((eng) => (
                                <Link
                                  key={eng.id}
                                  href={`/audit/engagements/${eng.id}`}
                                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 hover:underline"
                                >
                                  {eng.fiscalPeriod}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
