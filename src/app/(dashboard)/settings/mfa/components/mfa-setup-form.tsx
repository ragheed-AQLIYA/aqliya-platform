"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Check, Copy } from "lucide-react";

interface Props {
  secret: string | undefined;
  qrUri: string | undefined;
  copied: boolean;
  onCopy: () => void;
  verifyCode: string;
  onVerifyCodeChange: (value: string) => void;
  verifyError: string;
  verifyLoading: boolean;
  onVerify: (e: React.FormEvent) => Promise<void>;
}

export function MFASetupForm({
  secret,
  qrUri,
  copied,
  onCopy,
  verifyCode,
  onVerifyCodeChange,
  verifyError,
  verifyLoading,
  onVerify,
}: Props) {
  return (
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
              onClick={onCopy}
              className="w-full"
            >
              {copied ? (
                <><Check className="ml-2 h-4 w-4" /> تم النسخ</>
              ) : (
                <><Copy className="ml-2 h-4 w-4" /> نسخ رابط الإعداد</>
              )}
            </Button>
          </div>

          <form onSubmit={onVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-code">أدخل رمز التحقق من التطبيق</Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => onVerifyCodeChange(e.target.value)}
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
  );
}
