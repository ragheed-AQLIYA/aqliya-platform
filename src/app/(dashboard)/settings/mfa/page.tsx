"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Copy } from "lucide-react";
import { getMFASetup, enableMFA, disableMFA } from "@/actions/mfa";

export default function MFASettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState<string | undefined>("");
  const [qrUri, setQrUri] = useState<string | undefined>("");
  const [copied, setCopied] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const copyToClipboard = useCallback(async () => {
    if (!qrUri) return;
    try {
      await navigator.clipboard.writeText(qrUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API may fail in insecure contexts
    }
  }, [qrUri]);

  useEffect(() => {
    async function load() {
      try {
        const result = await getMFASetup();
        setMfaEnabled(result.enabled);
        if (!result.enabled) {
          setSecret(result.secret ?? "");
          setQrUri(result.qrUri ?? "");
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyError("");

    try {
      const result = await enableMFA(verifyCode);
      if (result.success) {
        setBackupCodes(result.backupCodes);
        setMfaEnabled(true);
        await update();
      }
    } catch (err: any) {
      setVerifyError(err?.message || "فشل التحقق");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setDisableLoading(true);
    setDisableError("");

    try {
      await disableMFA(disablePassword);
      setMfaEnabled(false);
      setSecret("");
      setQrUri("");
      setBackupCodes(null);
      setShowDisableConfirm(false);
      setDisablePassword("");
      await update();
    } catch (err: any) {
      setDisableError(err?.message || "فشل تعطيل التوثيق");
    } finally {
      setDisableLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="p-8 max-w-lg mx-auto">
        <p className="text-muted-foreground">جارٍ التحميل...</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-lg mx-auto" dir="rtl">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold">التحقق بخطوتين (MFA)</h1>
        <Badge variant={mfaEnabled ? "default" : "outline"}>
          {mfaEnabled ? "مُفعّل" : "غير مُفعّل"}
        </Badge>
      </div>

      {mfaEnabled && !showDisableConfirm && (
        <Card>
          <CardHeader>
            <CardTitle>تم تفعيل التحقق بخطوتين</CardTitle>
            <CardDescription>
              حسابك محمي بالتحقق بخطوتين. يمكنك تعطيله في أي وقت.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDisableConfirm(true)}
            >
              تعطيل التحقق بخطوتين
            </Button>
          </CardContent>
        </Card>
      )}

      {mfaEnabled && showDisableConfirm && (
        <Card>
          <CardHeader>
            <CardTitle>تعطيل التحقق بخطوتين</CardTitle>
            <CardDescription>
              أدخل كلمة المرور لتأكيد تعطيل التحقق بخطوتين.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDisable} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disable-password">كلمة المرور</Label>
                <Input
                  id="disable-password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  required
                />
              </div>
              {disableError && (
                <p className="text-sm text-destructive">{disableError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={disableLoading}
                >
                  {disableLoading ? "جارٍ التعطيل..." : "تأكيد التعطيل"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDisableConfirm(false);
                    setDisablePassword("");
                    setDisableError("");
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!mfaEnabled && backupCodes && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="text-base">
              رموز الاسترجاع الطارئة
            </CardTitle>
            <CardDescription>
              احفظ هذه الرموز في مكان آمن. كل رمز يمكن استخدامه مرة واحدة فقط.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm space-y-1 mb-4" dir="ltr">
              {backupCodes.map((code, i) => (
                <div key={i} className="p-1 bg-background rounded">{code}</div>
              ))}
            </div>
            {!backupCodesSaved && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBackupCodesSaved(true)}
              >
                لقد حفظت الرموز
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!mfaEnabled && !backupCodes && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تفعيل التحقق بخطوتين</CardTitle>
              <CardDescription>
                استخدم تطبيق توثيق مثل Google Authenticator أو Microsoft Authenticator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>المفتاح السري</Label>
                <div
                  className="mt-1 p-2 bg-muted rounded font-mono text-xs break-all select-all"
                  dir="ltr"
                >
                  {secret}
                </div>
              </div>
              <div>
                <Label>رابط الإعداد (انسخه في التطبيق)</Label>
                <div
                  className="mt-1 p-2 bg-muted rounded font-mono text-xs break-all select-all"
                  dir="ltr"
                >
                  {qrUri}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="w-full"
                >
                  {copied ? (
                    <><Check className="ml-2 h-4 w-4" /> تم النسخ</>
                  ) : (
                    <><Copy className="ml-2 h-4 w-4" /> نسخ رابط الإعداد</>
                  )}
                </Button>
              </div>

              <form onSubmit={handleEnable} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-code">
                    أدخل رمز التحقق من التطبيق
                  </Label>
                  <Input
                    id="verify-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="000000"
                    required
                  />
                </div>
                {verifyError && (
                  <p className="text-sm text-destructive">{verifyError}</p>
                )}
                <Button type="submit" disabled={verifyLoading || verifyCode.length !== 6}>
                  {verifyLoading ? "جارٍ التحقق..." : "تفعيل"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
