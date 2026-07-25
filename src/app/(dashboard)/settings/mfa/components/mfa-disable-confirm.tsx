"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Props {
  password: string;
  onPasswordChange: (value: string) => void;
  error: string;
  loading: boolean;
  onDisable: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export function MFADisableConfirm({
  password,
  onPasswordChange,
  error,
  loading,
  onDisable,
  onCancel,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تعطيل التحقق بخطوتين</CardTitle>
        <CardDescription>
          أدخل كلمة المرور لتأكيد تعطيل التحقق بخطوتين.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onDisable} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disable-password">كلمة المرور</Label>
            <Input
              id="disable-password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "جارٍ التعطيل..." : "تأكيد التعطيل"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
