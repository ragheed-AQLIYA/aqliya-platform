"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import {
  createCrmConnection,
  updateCrmConnection,
  testCrmConnection,
  getCrmConnection,
} from "@/lib/sales/crm/actions";
import {
  AR,
  EMPTY_FORM,
  type ProviderType,
  type ConnectionFormData,
} from "./constants";

function ConnectionFormDialogContent({
  editingId,
  onSaved,
  organizationId,
  onClose,
}: {
  editingId: string | null;
  onSaved: () => void;
  organizationId: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ConnectionFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editingId;

  useEffect(() => {
    if (editingId) {
      getCrmConnection(organizationId, editingId)
        .then((c) => {
          setForm({
            provider: (c.provider as ProviderType) ?? "hubspot",
            label: c.label ?? "",
            apiEndpoint: c.apiEndpoint ?? "",
            accessToken: "",
            refreshToken: "",
            apiKey: "",
            apiVersion: c.apiVersion ?? "",
            syncIntervalMin: c.syncIntervalMin ?? 60,
            conflictPolicy: c.conflictPolicy ?? "crm_wins",
          });
        })
        .catch(() => {});
    }
  }, [editingId, organizationId]);

  function set<K extends keyof ConnectionFormData>(
    k: K,
    v: ConnectionFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (isEditing) {
        await updateCrmConnection(organizationId, editingId, {
          label: form.label || undefined,
          apiEndpoint: form.apiEndpoint || undefined,
          accessToken: form.accessToken || undefined,
          refreshToken: form.refreshToken || undefined,
          apiKey: form.apiKey || undefined,
          apiVersion: form.apiVersion || undefined,
          syncIntervalMin: form.syncIntervalMin,
          conflictPolicy: form.conflictPolicy,
        });
      } else {
        await createCrmConnection(organizationId, {
          provider: form.provider,
          label: form.label,
          apiEndpoint: form.apiEndpoint || undefined,
          accessToken: form.accessToken || undefined,
          refreshToken: form.refreshToken || undefined,
          apiKey: form.apiKey || undefined,
          apiVersion: form.apiVersion || undefined,
          syncIntervalMin: form.syncIntervalMin,
          conflictPolicy: form.conflictPolicy,
        });
      }
      onClose();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!editingId) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testCrmConnection(organizationId, editingId);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <>
      <DialogContent className="sm:max-w-[520px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? AR.editConnection : AR.addConnection}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "قم بتعديل إعدادات اتصال CRM"
              : "أدخل بيانات اتصال CRM للمزامنة"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!isEditing && (
            <div className="grid gap-2">
              <Label>{AR.provider}</Label>
              <Select
                value={form.provider}
                onValueChange={(v) => set("provider", v as ProviderType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={AR.provider} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hubspot">{AR.providerHubspot}</SelectItem>
                  <SelectItem value="salesforce">
                    {AR.providerSalesforce}
                  </SelectItem>
                  <SelectItem value="apollo">{AR.providerApollo}</SelectItem>
                  <SelectItem value="custom">{AR.providerCustom}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label>{AR.connectionLabel}</Label>
            <Input
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder={AR.connectionLabel}
            />
          </div>

          {form.provider === "salesforce" || form.provider === "custom" ? (
            <div className="grid gap-2">
              <Label>{AR.apiEndpoint}</Label>
              <Input
                value={form.apiEndpoint}
                onChange={(e) => set("apiEndpoint", e.target.value)}
                placeholder="https://example.salesforce.com"
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>{AR.accessToken}</Label>
            <Input
              type="password"
              value={form.accessToken}
              onChange={(e) => set("accessToken", e.target.value)}
              placeholder={
                isEditing ? "اتركه فارغاً إذا لم يتغير" : "رمز الوصول"
              }
            />
          </div>

          {form.provider === "salesforce" ? (
            <div className="grid gap-2">
              <Label>{AR.refreshToken}</Label>
              <Input
                type="password"
                value={form.refreshToken}
                onChange={(e) => set("refreshToken", e.target.value)}
                placeholder="رمز التحديث"
              />
            </div>
          ) : form.provider === "hubspot" || form.provider === "apollo" ? (
            <div className="grid gap-2">
              <Label>{AR.apiKey}</Label>
              <Input
                type="password"
                value={form.apiKey}
                onChange={(e) => set("apiKey", e.target.value)}
                placeholder={
                  isEditing ? "اتركه فارغاً إذا لم يتغير" : AR.apiKey
                }
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>{AR.apiVersion}</Label>
            <Input
              value={form.apiVersion}
              onChange={(e) => set("apiVersion", e.target.value)}
              placeholder="v1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{AR.syncInterval}</Label>
              <Input
                type="number"
                min={5}
                value={form.syncIntervalMin}
                onChange={(e) =>
                  set("syncIntervalMin", Number(e.target.value))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{AR.conflictPolicy}</Label>
              <Select
                value={form.conflictPolicy}
                onValueChange={(v) => set("conflictPolicy", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crm_wins">{AR.crmWins}</SelectItem>
                  <SelectItem value="local_wins">{AR.localWins}</SelectItem>
                  <SelectItem value="manual">{AR.manual}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {testResult ? (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                testResult.success
                  ? "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                  : "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
              }`}
            >
              {testResult.message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {isEditing ? (
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  {AR.testing}
                </>
              ) : (
                <>
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                  {AR.testConnection}
                </>
              )}
            </Button>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {AR.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.label.trim()}>
            {saving ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                {AR.save}
              </>
            ) : (
              AR.save
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </>
  );
}

export function ConnectionFormDialog({
  open,
  onOpenChange,
  editingId,
  onSaved,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingId: string | null;
  onSaved: () => void;
  organizationId: string;
}) {
  if (!open) return null;
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <ConnectionFormDialogContent
        key={editingId ?? "new"}
        editingId={editingId}
        onSaved={onSaved}
        organizationId={organizationId}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
