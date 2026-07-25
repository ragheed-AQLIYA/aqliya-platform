"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings2,
  ExternalLink,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import type { SsoProviderResponse } from "@/lib/auth/sso-service";
import type { TestStatusState } from "./use-sso-settings";
import { providerLabel } from "./use-sso-settings";

const PROVIDER_ICONS: Record<string, string> = {
  google: "G",
  github: "GH",
  "azure-ad": "AZ",
  okta: "OK",
  "custom-oidc": "OIDC",
  saml: "SAML",
};

interface SsoProviderCardProps {
  provider: SsoProviderResponse;
  testStatus: TestStatusState | null;
  togglingId: string | null;
  deletingId: string | null;
  deleteConfirmId: string | null;
  onEdit: (provider: SsoProviderResponse) => void;
  onTest: (provider: SsoProviderResponse) => void;
  onToggle: (providerId: string, enabled: boolean) => void;
  onDeleteConfirm: (providerId: string) => void;
  onDeleteCancel: () => void;
  onDelete: (providerId: string) => Promise<void>;
}

function StatusBadge({ label, variant }: { label: string; variant: "default" | "success" | "warning" | "destructive" }) {
  const colors: Record<string, string> = {
    default: "",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant]}`}>
      {label}
    </span>
  );
}

export function SsoProviderCard({
  provider,
  testStatus,
  togglingId,
  deletingId,
  deleteConfirmId,
  onEdit,
  onTest,
  onToggle,
  onDeleteConfirm,
  onDeleteCancel,
  onDelete,
}: SsoProviderCardProps) {
  const isCurrentTest = testStatus?.providerId === provider.id;
  const isTogglingCurrent = togglingId === provider.id;
  const isDeletingCurrent = deletingId === provider.id;
  const isDeleteConfirmCurrent = deleteConfirmId === provider.id;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              {PROVIDER_ICONS[provider.providerType] || "SSO"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{provider.label}</h3>
                {provider.enabled ? (
                  <StatusBadge label="مفعل" variant="success" />
                ) : (
                  <StatusBadge label="معطل" variant="destructive" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {providerLabel(provider.providerType)}
              </p>
              {Array.isArray(provider.domains) && (provider.domains as string[]).length > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">النطاقات المسموحة:</span>
                  {(provider.domains as string[]).map((domain) => (
                    <Badge key={domain} variant="outline" className="text-xs">{domain}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => onEdit(provider)} className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            تعديل
          </Button>

          <Button
            variant="outline" size="sm" onClick={() => onTest(provider)}
            disabled={isCurrentTest && testStatus?.loading}
            className="gap-1.5"
          >
            {isCurrentTest && testStatus?.loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            اختبار
          </Button>

          <Button
            variant={provider.enabled ? "secondary" : "default"} size="sm"
            onClick={() => onToggle(provider.id, provider.enabled)}
            disabled={isTogglingCurrent}
            className="gap-1.5"
          >
            {isTogglingCurrent ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : provider.enabled ? (
              <XCircle className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {provider.enabled ? "تعطيل" : "تفعيل"}
          </Button>

          {isDeleteConfirmCurrent ? (
            <div className="flex items-center gap-2 mr-auto">
              <p className="text-xs text-destructive">تأكيد الحذف؟</p>
              <Button
                variant="destructive" size="sm"
                onClick={() => onDelete(provider.id)}
                disabled={isDeletingCurrent}
              >
                {isDeletingCurrent ? "جارٍ الحذف..." : "حذف"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onDeleteCancel}>إلغاء</Button>
            </div>
          ) : (
            <Button
              variant="ghost" size="sm"
              onClick={() => onDeleteConfirm(provider.id)}
              className="mr-auto text-destructive hover:text-destructive gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف
            </Button>
          )}
        </div>

        {isCurrentTest && !testStatus.loading && (
          <div className={`mt-3 text-sm flex items-center gap-2 ${testStatus.success ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
            {testStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {testStatus.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
