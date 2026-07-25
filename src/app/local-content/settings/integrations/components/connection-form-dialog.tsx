"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

import { createErpConnectionAction } from "@/actions/erp-actions";

import type { ErpConnection as PrismaErpConnection } from "@prisma/client";

type ErpConnection = PrismaErpConnection;

interface ConnectionFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: ErpConnection | null;
  onSave: (
    data: Parameters<typeof createErpConnectionAction>[0],
  ) => Promise<void>;
}

export function ConnectionFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: ConnectionFormDialogProps) {
  const [provider, setProvider] = useState(initial?.provider ?? "sap");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [connectionType, setConnectionType] = useState(
    initial?.connectionType ?? "api",
  );
  const [apiEndpoint, setApiEndpoint] = useState(
    initial?.apiEndpoint ?? "",
  );
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [sftpHost, setSftpHost] = useState("");
  const [sftpPort, setSftpPort] = useState(22);
  const [sftpUsername, setSftpUsername] = useState("");
  const [sftpKey, setSftpKey] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState(
    initial?.defaultCurrency ?? "SAR",
  );
  const [syncIntervalMin, setSyncIntervalMin] = useState(
    initial?.syncIntervalMin ?? 1440,
  );
  const [sourceSystem, setSourceSystem] = useState(
    initial?.sourceSystem ?? "",
  );
  const [saving, setSaving] = useState(false);

  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Parameters<typeof createErpConnectionAction>[0] = {
        provider,
        label,
        connectionType,
        defaultCurrency,
        syncIntervalMin,
        sourceSystem: sourceSystem || undefined,
        fieldMapping: undefined,
      };
      if (connectionType === "api" || connectionType === "custom") {
        data.apiEndpoint = apiEndpoint || undefined;
        if (apiKey) data.apiKey = apiKey;
        if (apiSecret) data.apiSecret = apiSecret;
      }
      if (connectionType === "sftp") {
        data.sftpHost = sftpHost || undefined;
        data.sftpPort = sftpPort;
        data.sftpUsername = sftpUsername || undefined;
        if (sftpKey) data.sftpKey = sftpKey;
      }
      await onSave(data);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل اتصال ERP" : "إضافة اتصال ERP جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "تعديل إعدادات اتصال نظام التخطيط"
              : "إعداد اتصال جديد لنظام تخطيط موارد المؤسسة"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>نوع الموفر</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموفر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sap">SAP ERP</SelectItem>
                  <SelectItem value="oracle">Oracle EBS</SelectItem>
                  <SelectItem value="microsoft-dynamics">
                    Microsoft Dynamics
                  </SelectItem>
                  <SelectItem value="odoo">Odoo ERP</SelectItem>
                  <SelectItem value="csv-upload">رفع ملف CSV</SelectItem>
                  <SelectItem value="custom">مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>اسم الاتصال</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="مثال: ERP السعودية"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>نوع الاتصال</Label>
              <Select value={connectionType} onValueChange={setConnectionType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="sftp">SFTP</SelectItem>
                  <SelectItem value="file_drop">رفع ملفات</SelectItem>
                  <SelectItem value="custom">مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>العملة الافتراضية</Label>
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                  <SelectItem value="EUR">يورو (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(connectionType === "api" || connectionType === "custom") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>رابط API</Label>
                <Input
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://erp.example.com/api/"
                />
              </div>
              <div className="space-y-1.5">
                <Label>مفتاح API</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={isEdit ? "••••••••" : "أدخل المفتاح"}
                />
              </div>
              <div className="space-y-1.5">
                <Label>الرمز السري</Label>
                <Input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder={isEdit ? "••••••••" : "أدخل الرمز السري"}
                />
              </div>
            </div>
          )}

          {connectionType === "sftp" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>المضيف</Label>
                <Input
                  value={sftpHost}
                  onChange={(e) => setSftpHost(e.target.value)}
                  placeholder="sftp.example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>المنفذ</Label>
                <Input
                  type="number"
                  value={sftpPort}
                  onChange={(e) => setSftpPort(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>اسم المستخدم</Label>
                <Input
                  value={sftpUsername}
                  onChange={(e) => setSftpUsername(e.target.value)}
                  placeholder="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label>مفتاح SFTP</Label>
                <Input
                  type="password"
                  value={sftpKey}
                  onChange={(e) => setSftpKey(e.target.value)}
                  placeholder={isEdit ? "••••••••" : "أدخل المفتاح"}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>النظام المصدر</Label>
              <Input
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
                placeholder="SAP ERP / Oracle Fusion"
              />
            </div>
            <div className="space-y-1.5">
              <Label>فترة المزامنة (دقائق)</Label>
              <Input
                type="number"
                value={syncIntervalMin}
                onChange={(e) => setSyncIntervalMin(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                  جارٍ الحفظ...
                </>
              ) : isEdit ? (
                "حفظ التغييرات"
              ) : (
                "إضافة الاتصال"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
