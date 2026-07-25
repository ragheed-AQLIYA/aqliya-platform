"use client";

import { useState, useEffect, useCallback } from "react";
import type { SsoProviderResponse } from "@/lib/auth/sso-service";

export interface FormData {
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

export const PROVIDER_TYPES = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "azure-ad", label: "Azure AD" },
  { id: "okta", label: "Okta" },
  { id: "custom-oidc", label: "OIDC مخصص" },
  { id: "saml", label: "SAML" },
] as const;

export function providerLabel(type: string): string {
  const p = PROVIDER_TYPES.find((pt) => pt.id === type);
  return p?.label || type;
}

export interface TestStatusState {
  providerId: string;
  loading: boolean;
  success?: boolean;
  message?: string;
}

export interface SsoSettingsReturn {
  providers: SsoProviderResponse[];
  loading: boolean;
  error: string;
  dialogOpen: boolean;
  editingId: string | null;
  formData: FormData;
  saving: boolean;
  deleting: string | null;
  testStatus: TestStatusState | null;
  deleteConfirm: string | null;
  formError: string;
  toggling: string | null;
  loadProviders: () => Promise<void>;
  openAddDialog: () => void;
  openEditDialog: (provider: SsoProviderResponse) => Promise<void>;
  handleSave: React.FormEventHandler<HTMLFormElement>;
  handleDelete: (providerId: string) => Promise<void>;
  handleToggle: (providerId: string, currentEnabled: boolean) => Promise<void>;
  handleTest: (provider: SsoProviderResponse) => Promise<void>;
  setDialogOpen: (open: boolean) => void;
  setError: (error: string) => void;
  setFormError: (error: string) => void;
  setDeleteConfirm: (id: string | null) => void;
  updateFormField: (field: keyof FormData, value: string) => void;
}

export function useSsoSettings(): SsoSettingsReturn {
  const [providers, setProviders] = useState<SsoProviderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<TestStatusState | null>(null);
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
      clientSecret: "",
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

  const handleSave: React.FormEventHandler<HTMLFormElement> = async (e) => {
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
  };

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

  function updateFormField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  return {
    providers,
    loading,
    error,
    dialogOpen,
    editingId,
    formData,
    saving,
    deleting,
    testStatus,
    deleteConfirm,
    formError,
    toggling,
    loadProviders,
    openAddDialog,
    openEditDialog,
    handleSave,
    handleDelete,
    handleToggle,
    handleTest,
    setDialogOpen,
    setError,
    setFormError,
    setDeleteConfirm,
    updateFormField,
  };
}
