"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PROVIDER_TYPES } from "./use-sso-settings";
import type { FormData } from "./use-sso-settings";

interface SsoFormDialogProps {
  open: boolean;
  editingId: string | null;
  formData: FormData;
  saving: boolean;
  formError: string;
  onOpenChange: (open: boolean) => void;
  onFieldChange: (field: keyof FormData, value: string) => void;
  onSave: React.FormEventHandler<HTMLFormElement>;
}

function FormField({
  id, label, value, onChange, placeholder, type, required, hint,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function isOidc(type: string) {
  return type === "okta" || type === "custom-oidc";
}

export function SsoFormDialog({
  open, editingId, formData, saving, formError,
  onOpenChange, onFieldChange, onSave,
}: SsoFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "تعديل مزود الدخول الموحد" : "إضافة مزود دخول موحد"}
          </DialogTitle>
          <DialogDescription>
            {editingId ? "قم بتحديث إعدادات المزود" : "أدخل بيانات مزود الدخول الموحد الجديد"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="providerType">نوع المزود</Label>
            <Select
              value={formData.providerType}
              onValueChange={(v) => onFieldChange("providerType", v)}
              disabled={!!editingId}
            >
              <SelectTrigger id="providerType">
                <SelectValue placeholder="اختر نوع المزود" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_TYPES.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>{pt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormField
            id="label" label="الاسم التعريفي"
            value={formData.label}
            onChange={(v) => onFieldChange("label", v)}
            placeholder="مثال: Google Workspace - الشركة"
            required
          />

          <FormField
            id="clientId" label="معرّف العميل (Client ID)"
            value={formData.clientId}
            onChange={(v) => onFieldChange("clientId", v)}
            placeholder="..."
          />

          <div className="space-y-2">
            <Label htmlFor="clientSecret">سر العميل (Client Secret)</Label>
            <Input
              id="clientSecret" type="password"
              value={formData.clientSecret}
              onChange={(e) => onFieldChange("clientSecret", e.target.value)}
              placeholder={editingId ? "اترك فارغاً إذا لم يتغير" : "أدخل المفتاح السري"}
            />
            {editingId && (
              <p className="text-xs text-muted-foreground">
                اترك الحقل فارغاً للحفاظ على المفتاح السري الحالي
              </p>
            )}
          </div>

          <FormField
            id="domains" label="النطاقات المسموحة (مفصولة بفواصل)"
            value={formData.domains}
            onChange={(v) => onFieldChange("domains", v)}
            placeholder="@company.com, @sub.company.com"
          />

          {isOidc(formData.providerType) && (
            <>
              <FormField
                id="issuerUrl" label="رابط المُصدر (Issuer URL)"
                value={formData.issuerUrl}
                onChange={(v) => onFieldChange("issuerUrl", v)}
                placeholder="https://..."
              />
              <FormField
                id="authorizationUrl" label="رابط التفويض (Authorization URL)"
                value={formData.authorizationUrl}
                onChange={(v) => onFieldChange("authorizationUrl", v)}
                placeholder="https://..."
              />
              <FormField
                id="tokenUrl" label="رابط الرمز (Token URL)"
                value={formData.tokenUrl}
                onChange={(v) => onFieldChange("tokenUrl", v)}
                placeholder="https://..."
              />
              <FormField
                id="userInfoUrl" label="رابط معلومات المستخدم (UserInfo URL)"
                value={formData.userInfoUrl}
                onChange={(v) => onFieldChange("userInfoUrl", v)}
                placeholder="https://..."
              />
            </>
          )}

          {formData.providerType === "saml" && (
            <>
              <FormField
                id="samlEntryPoint" label="رابط الدخول SAML (Entry Point)"
                value={formData.samlEntryPoint}
                onChange={(v) => onFieldChange("samlEntryPoint", v)}
                placeholder="https://..."
              />
              <FormField
                id="samlIssuer" label="مُصدر SAML (Issuer)"
                value={formData.samlIssuer}
                onChange={(v) => onFieldChange("samlIssuer", v)}
                placeholder="urn:..."
              />
              <div className="space-y-2">
                <Label htmlFor="samlCert">الشهادة SAML (Certificate)</Label>
                <Textarea
                  id="samlCert"
                  value={formData.samlCert}
                  onChange={(e) => onFieldChange("samlCert", e.target.value)}
                  placeholder="-----BEGIN CERTIFICATE-----..."
                  className="font-mono text-xs"
                  rows={4}
                />
              </div>
            </>
          )}

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "جارٍ الحفظ..." : editingId ? "حفظ التغييرات" : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
