import { getCurrentUser } from "@/lib/auth";
import { getPlatformOrganizationByLegacyOrganizationId } from "@/lib/platform/platform-organization-context";
import { getPlatformOrgGuardReport } from "@/lib/platform/guards/platform-org-guard";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

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

export default async function PlatformOrganizationPage() {
  const user = await getCurrentUser();

  // Run guard report
  const guardReport = await getPlatformOrgGuardReport(user);

  let platformOrg = null;
  let platformOrgError: string | null = null;

  try {
    if (user.platformOrganizationId) {
      platformOrg = await getPlatformOrganizationByLegacyOrganizationId(
        user.organizationId,
      );
    } else {
      platformOrgError =
        "User session does not include platformOrganizationId.";
    }
  } catch (e) {
    platformOrgError =
      e instanceof Error
        ? e.message
        : "Failed to resolve platform organization";
  }

  // Fetch linked legacy records
  let legacyDecisionOrg: { id: string; name: string } | null = null;
  let legacyAuditOrgs: { id: string; name: string; slug: string }[] = [];

  if (platformOrg) {
    const decisionOrgs = await prisma.organization.findMany({
      where: { platformOrganizationId: platformOrg.platformOrganizationId },
      select: { id: true, name: true },
    });
    legacyDecisionOrg = decisionOrgs[0] ?? null;

    const auditOrgs = await prisma.auditOrganization.findMany({
      where: { platformOrganizationId: platformOrg.platformOrganizationId },
      select: { id: true, name: true, slug: true },
    });
    legacyAuditOrgs = auditOrgs;
  }

  // Session vs resolved check
  const sessionMatchesResolved =
    platformOrg &&
    user.platformOrganizationId === platformOrg.platformOrganizationId;

  return (
    <main className="p-8 max-w-3xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Platform Organization Linkage</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        This page is for platform linkage verification only. It shows how the
        current user session maps to PlatformOrganization and its linked legacy
        records.
      </p>

      {/* Guard Report */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Guard Report</CardTitle>
          <CardDescription>
            Platform organization guard diagnostics — report-only, non-blocking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium">Status:</span>
            {guardReport.severity === "ok" ? (
              <StatusBadge label="OK" variant="success" />
            ) : guardReport.severity === "warning" ? (
              <StatusBadge label="Warning" variant="warning" />
            ) : (
              <StatusBadge label="Error" variant="destructive" />
            )}
          </div>

          {guardReport.warnings.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                Warnings:
              </p>
              <ul className="space-y-1">
                {guardReport.warnings.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-yellow-700 dark:text-yellow-300"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guardReport.errors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                Errors:
              </p>
              <ul className="space-y-1">
                {guardReport.errors.map((e, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300"
                  >
                    <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guardReport.ok && (
            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>All checks passed.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Current Session</CardTitle>
          <CardDescription>
            Authenticated user context from NextAuth session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground mb-0.5">User ID</dt>
              <dd className="font-mono text-xs">{user.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-0.5">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-0.5">Role</dt>
              <dd>
                <Badge variant="outline">{user.role}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-0.5">
                Legacy Organization ID
              </dt>
              <dd className="font-mono text-xs">{user.organizationId}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground mb-0.5">
                Platform Organization ID
                {user.platformOrganizationId ? (
                  <CheckCircle2 className="inline h-3.5 w-3.5 text-green-600 mr-1.5" />
                ) : (
                  <XCircle className="inline h-3.5 w-3.5 text-red-500 mr-1.5" />
                )}
              </dt>
              <dd className="font-mono text-xs">
                {user.platformOrganizationId ?? (
                  <span className="text-red-500">Not set in session</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Platform Organization */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Platform Organization</CardTitle>
          <CardDescription>
            Resolved from session platformOrganizationId via legacy organization
            link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {platformOrgError ? (
            <div className="flex items-start gap-3 p-3 rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                  Platform Organization Not Resolved
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {platformOrgError}
                </p>
              </div>
            </div>
          ) : platformOrg ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground mb-0.5">ID</dt>
                <dd className="font-mono text-xs">
                  {platformOrg.platformOrganizationId}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">Slug</dt>
                <dd className="font-mono text-xs">{platformOrg.slug}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">Name</dt>
                <dd>{platformOrg.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">Display Name</dt>
                <dd>
                  {platformOrg.displayName ?? (
                    <span className="text-muted-foreground italic">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">Status</dt>
                <dd>
                  {platformOrg.status === "active" ? (
                    <StatusBadge label="Active" variant="success" />
                  ) : (
                    <StatusBadge label={platformOrg.status} variant="warning" />
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">Resolved via</dt>
                <dd className="font-mono text-xs">{platformOrg.source}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              No platform organization data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Session Consistency Check */}
      {platformOrg && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Session Consistency</CardTitle>
            <CardDescription>
              Verifies that the platformOrganizationId in session matches the
              resolved context
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionMatchesResolved ? (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
                <span>
                  Session platformOrganizationId matches resolved context.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-red-800 dark:text-red-200">
                    Mismatch Detected
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    Session: {user.platformOrganizationId ?? "undefined"} —
                    Resolved: {platformOrg.platformOrganizationId}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Linked Legacy Records */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Linked Legacy Records</CardTitle>
          <CardDescription>
            DecisionOS and AuditOS organizations linked to this
            PlatformOrganization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">
                DecisionOS Organizations
              </h3>
              {legacyDecisionOrg ? (
                <div className="flex items-center justify-between p-3 rounded-md border">
                  <div>
                    <p className="font-mono text-xs">{legacyDecisionOrg.id}</p>
                    <p className="text-sm">{legacyDecisionOrg.name}</p>
                  </div>
                  <StatusBadge label="Linked" variant="success" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No DecisionOS organizations linked to this
                  PlatformOrganization.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">
                AuditOS Organizations
              </h3>
              {legacyAuditOrgs.length > 0 ? (
                <div className="space-y-2">
                  {legacyAuditOrgs.map((ao) => (
                    <div
                      key={ao.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <div>
                        <p className="font-mono text-xs">{ao.id}</p>
                        <p className="text-sm">{ao.name}</p>
                        <p className="text-xs text-muted-foreground">
                          slug: {ao.slug}
                        </p>
                      </div>
                      <StatusBadge label="Linked" variant="success" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No AuditOS organizations linked to this PlatformOrganization.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
