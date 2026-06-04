"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Settings2,
} from "lucide-react";
import type { SsoProviderResponse } from "@/lib/auth/sso-service";

const PROVIDER_TYPES = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "azure-ad", label: "Azure AD" },
  { id: "okta", label: "Okta" },
  { id: "custom-oidc", label: "OIDC مخصص" },
  { id: "saml", label: "SAML" },
] as const;

const PROVIDER_ICONS: Record<string, string> = {
  google: "G",
  github: "GH",
  "azure-ad": "AZ",
  okta: "OK",
  "custom-oidc": "OIDC",
  saml: "SAML",
};

interface FormData {
  providerType: string;
  label: string;
  clientId: string;
  clientSecret: string;
  issuerUrl: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  jwksUri: string;
  samlEntryPoint: string;
  samlIssuer: string;
  samlCert: string;
  domains: string;
}

const emptyForm: FormData = {
  providerType: "",
  label: "",
  clientId: "",
  clientSecret: "",
  issuerUrl: "",
  authorizationUrl: "",
  tokenUrl: "",
  userInfoUrl: "",
  jwksUri: "",
  samlEntryPoint: "",
  samlIssuer: "",
  samlCert: "",
  domains: "",
};

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
    destructive:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant]}`}
    >
      {label}
    </span>
  );
}

export default function SsoSettingsPage() {
  const [providers, setProviders] = useState<SsoProviderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{
    providerId: string;
    loading: boolean;
    success?: boolean;
    message?: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { listSsoProvidersAction } = await import(
        "@/actions/sso-admin-actions"
      );
      const data = await listSsoProvidersAction();
      setProviders(data);
    } catch {
      setError("فشل تحميل إعدادات الدخول الموحد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  function openAddDialog() {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
    setDialogOpen(true);
  }

  async function openEditDialog(provider: SsoProviderResponse) {
    setEditingId(provider.id);
    setFormData({
      providerType: provider.providerType,
      label: provider.label,
      clientId: provider.clientId || "",
      clientSecret: provider.clientSecret || "",
      issuerUrl: provider.issuerUrl || "",
      authorizationUrl: provider.authorizationUrl || "",
      tokenUrl: provider.tokenUrl || "",
      userInfoUrl: provider.userInfoUrl || "",
      jwksUri: provider.jwksUri || "",
      samlEntryPoint: provider.samlEntryPoint || "",
      samlIssuer: provider.samlIssuer || "",
      samlCert: provider.samlCert || "",
      domains: Array.isArray(provider.domains)
        ? (provider.domains as string[]).join(", ")
        : "",
    });
    setFormError("");
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const actions = await import("@/actions/sso-admin-actions");

      if (editingId) {
        await actions.updateSsoProviderAction(editingId, {
          label: formData.label,
          clientId: formData.clientId || undefined,
          clientSecret: formData.clientSecret || undefined,
          issuerUrl: formData.issuerUrl || undefined,
          authorizationUrl: formData.authorizationUrl || undefined,
          tokenUrl: formData.tokenUrl || undefined,
          userInfoUrl: formData.userInfoUrl || undefined,
          jwksUri: formData.jwksUri || undefined,
          samlEntryPoint: formData.samlEntryPoint || undefined,
          samlIssuer: formData.samlIssuer || undefined,
          samlCert: formData.samlCert || undefined,
          domains: formData.domains
            ? formData.domains.split(",").map((d) => d.trim()).filter(Boolean)
            : undefined,
        });
      } else {
        await actions.createSsoProviderAction({
          providerType: formData.providerType,
          label: formData.label,
          clientId: formData.clientId || undefined,
          clientSecret: formData.clientSecret || undefined,
          issuerUrl: formData.issuerUrl || undefined,
          authorizationUrl: formData.authorizationUrl || undefined,
          tokenUrl: formData.tokenUrl || undefined,
          userInfoUrl: formData.userInfoUrl || undefined,
          jwksUri: formData.jwksUri || undefined,
          samlEntryPoint: formData.samlEntryPoint || undefined,
          samlIssuer: formData.samlIssuer || undefined,
          samlCert: formData.samlCert || undefined,
          domains: formData.domains
            ? formData.domains.split(",").map((d) => d.trim()).filter(Boolean)
            : undefined,
        });
      }

      setDialogOpen(false);
      await loadProviders();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "فشل حفظ الإعدادات",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(providerId: string) {
    setDeleting(providerId);
    try {
      const { deleteSsoProviderAction } = await import(
        "@/actions/sso-admin-actions"
      );
      await deleteSsoProviderAction(providerId);
      setDeleteConfirm(null);
      await loadProviders();
    } catch {
      setError("فشل حذف المزود");
    } finally {
      setDeleting(null);
    }
  }

  async function handleToggle(providerId: string, currentEnabled: boolean) {
    setToggling(providerId);
    try {
      const { toggleSsoProviderAction } = await import(
        "@/actions/sso-admin-actions"
      );
      await toggleSsoProviderAction(providerId, !currentEnabled);
      await loadProviders();
    } catch {
      setError("فشل تغيير حالة المزود");
    } finally {
      setToggling(null);
    }
  }

  async function handleTest(provider: SsoProviderResponse) {
    setTestStatus({ providerId: provider.id, loading: true });
    try {
      const { testSsoProviderConfigAction } = await import(
        "@/actions/sso-admin-actions"
      );
      const result = await testSsoProviderConfigAction(provider.providerType);
      setTestStatus({
        providerId: provider.id,
        loading: false,
        success: result.success,
        message: result.message,
      });
    } catch {
      setTestStatus({
        providerId: provider.id,
        loading: false,
        success: false,
        message: "فشل اختبار الإعدادات",
      });
    }
  }

  function providerLabel(type: string): string {
    const p = PROVIDER_TYPES.find((pt) => pt.id === type);
    return p?.label || type;
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[40vh]"
        dir="rtl"
      >
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            جارٍ تحميل إعدادات الدخول الموحد...
          </p>
        </div>
      </div>
    );
  }

  if (error && providers.length === 0) {
    return (
      <div
        className="flex items-center justify-center min-h-[40vh]"
        dir="rtl"
      >
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button onClick={loadProviders} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات الدخول الموحد</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة مزودي الدخول الموحد (SSO) للمنشأة
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مزود
        </Button>
      </div>

      {/* Error banner */}
      {error && providers.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError("")}
            >
              إخفاء
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {providers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <div>
              <p className="text-lg font-medium">
                لم يتم تكوين أي مزود دخول موحد بعد
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                أضف مزود دخول موحد للسماح لأعضاء المنشأة بتسجيل الدخول عبر
                حساباتهم الخارجية
              </p>
            </div>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة مزود دخول موحد
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Provider list */
        <div className="space-y-4">
          {providers.map((provider) => (
            <Card key={provider.id}>
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
                          <StatusBadge
                            label="مفعل"
                            variant="success"
                          />
                        ) : (
                          <StatusBadge
                            label="معطل"
                            variant="destructive"
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {providerLabel(provider.providerType)}
                      </p>
                      {Array.isArray(provider.domains) && (provider.domains as string[]).length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            النطاقات المسموحة:
                          </span>
                          {(provider.domains as string[]).map((domain) => (
                            <Badge
                              key={domain}
                              variant="outline"
                              className="text-xs"
                            >
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(provider)}
                    className="gap-1.5"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    تعديل
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(provider)}
                    disabled={
                      testStatus?.providerId === provider.id &&
                      testStatus?.loading
                    }
                    className="gap-1.5"
                  >
                    {testStatus?.providerId === provider.id &&
                    testStatus?.loading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                    اختبار
                  </Button>

                  <Button
                    variant={provider.enabled ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleToggle(provider.id, provider.enabled)}
                    disabled={toggling === provider.id}
                    className="gap-1.5"
                  >
                    {toggling === provider.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : provider.enabled ? (
                      <XCircle className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {provider.enabled ? "تعطيل" : "تفعيل"}
                  </Button>

                  {deleteConfirm === provider.id ? (
                    <div className="flex items-center gap-2 mr-auto">
                      <p className="text-xs text-destructive">
                        تأكيد الحذف؟
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(provider.id)}
                        disabled={deleting === provider.id}
                      >
                        {deleting === provider.id
                          ? "جارٍ الحذف..."
                          : "حذف"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(provider.id)}
                      className="mr-auto text-destructive hover:text-destructive gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </Button>
                  )}
                </div>

                {/* Test result */}
                {testStatus?.providerId === provider.id &&
                  !testStatus.loading && (
                    <div
                      className={`mt-3 text-sm flex items-center gap-2 ${
                        testStatus.success
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive"
                      }`}
                    >
                      {testStatus.success ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {testStatus.message}
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "تعديل مزود الدخول الموحد" : "إضافة مزود دخول موحد"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "قم بتحديث إعدادات المزود"
                : "أدخل بيانات مزود الدخول الموحد الجديد"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="providerType">نوع المزود</Label>
              <Select
                value={formData.providerType}
                onValueChange={(v) =>
                  setFormData({ ...formData, providerType: v })
                }
                disabled={!!editingId}
              >
                <SelectTrigger id="providerType">
                  <SelectValue placeholder="اختر نوع المزود" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_TYPES.map((pt) => (
                    <SelectItem key={pt.id} value={pt.id}>
                      {pt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">الاسم التعريفي</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="مثال: Google Workspace - الشركة"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">معرّف العميل (Client ID)</Label>
              <Input
                id="clientId"
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                placeholder="..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">
                سر العميل (Client Secret)
              </Label>
              <Input
                id="clientSecret"
                type="password"
                value={formData.clientSecret}
                onChange={(e) =>
                  setFormData({ ...formData, clientSecret: e.target.value })
                }
                placeholder="..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domains">
                النطاقات المسموحة (مفصولة بفواصل)
              </Label>
              <Input
                id="domains"
                value={formData.domains}
                onChange={(e) =>
                  setFormData({ ...formData, domains: e.target.value })
                }
                placeholder="@company.com, @sub.company.com"
              />
            </div>

            {/* OIDC fields */}
            {(formData.providerType === "okta" ||
              formData.providerType === "custom-oidc") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="issuerUrl">رابط المُصدر (Issuer URL)</Label>
                  <Input
                    id="issuerUrl"
                    value={formData.issuerUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, issuerUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authorizationUrl">
                    رابط التفويض (Authorization URL)
                  </Label>
                  <Input
                    id="authorizationUrl"
                    value={formData.authorizationUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authorizationUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenUrl">رابط الرمز (Token URL)</Label>
                  <Input
                    id="tokenUrl"
                    value={formData.tokenUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, tokenUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userInfoUrl">
                    رابط معلومات المستخدم (UserInfo URL)
                  </Label>
                  <Input
                    id="userInfoUrl"
                    value={formData.userInfoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, userInfoUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {/* SAML fields */}
            {formData.providerType === "saml" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="samlEntryPoint">
                    رابط الدخول SAML (Entry Point)
                  </Label>
                  <Input
                    id="samlEntryPoint"
                    value={formData.samlEntryPoint}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        samlEntryPoint: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="samlIssuer">
                    مُصدر SAML (Issuer)
                  </Label>
                  <Input
                    id="samlIssuer"
                    value={formData.samlIssuer}
                    onChange={(e) =>
                      setFormData({ ...formData, samlIssuer: e.target.value })
                    }
                    placeholder="urn:..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="samlCert">
                    الشهادة SAML (Certificate)
                  </Label>
                  <Textarea
                    id="samlCert"
                    value={formData.samlCert}
                    onChange={(e) =>
                      setFormData({ ...formData, samlCert: e.target.value })
                    }
                    placeholder="-----BEGIN CERTIFICATE-----..."
                    className="font-mono text-xs"
                    rows={4}
                  />
                </div>
              </>
            )}

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "جارٍ الحفظ..."
                  : editingId
                    ? "حفظ التغييرات"
                    : "إضافة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
