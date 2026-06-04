"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [justRegistered, setJustRegistered] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    setJustRegistered(
      new URL(window.location.href).searchParams.get("registered") === "true",
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("بريد إلكتروني أو كلمة مرور غير صحيحة");
        setLoading(false);
      } else if (res?.ok) {
        const verifyRes = await fetch("/api/auth/session");
        const session = await verifyRes.json();

        if (session?.user) {
          setRedirecting(true);
          const url = new URL(window.location.href);
          const rawCallback = url.searchParams.get("callbackUrl") || "/";
          // Prevent open redirects: accept only relative, same-origin paths.
          const callbackUrl =
            rawCallback.startsWith("/") && !rawCallback.startsWith("//")
              ? rawCallback
              : "/";
          window.location.href = callbackUrl;
        } else {
          setError("تم تسجيل الدخول ولكن الجلسة لم تُنشأ. حاول مرة أخرى.");
          setLoading(false);
        }
      } else {
        setError("حدث خطأ غير متوقع. حاول مرة أخرى.");
        setLoading(false);
      }
    } catch {
      setError("حدث خطأ في الاتصال. حاول مرة أخرى.");
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-8"
      dir="rtl"
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>الدخول إلى مساحة العمل المؤسسية</CardTitle>
          <CardDescription>
            أدخل بياناتك للوصول إلى بيئة تشغيل محكومة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {justRegistered && (
            <p className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-800 dark:text-green-200">
              تم إنشاء المنشأة بنجاح. سجّل الدخول ببريدك وكلمة المرور.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {redirecting && (
              <p className="text-sm text-muted-foreground">
                جارٍ التوجيه إلى مساحة العمل...
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || redirecting}
            >
              {redirecting
                ? "جارٍ التوجيه..."
                : loading
                  ? "جارٍ تسجيل الدخول..."
                  : "تسجيل الدخول"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <a
              href="/signup"
              className="font-medium text-foreground underline hover:text-foreground/80"
            >
              إنشاء منشأة جديدة
            </a>
          </p>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            بعد تحديث التطبيق أو إعادة نشر Docker: نفّذ تحديثاً قسرياً للصفحة
            (Ctrl+Shift+R) إذا ظهرت شاشة تحميل بدون نهاية.
          </p>
        </CardContent>
      </Card>

      <Card className="w-full max-w-sm mt-4 border-dashed border-muted-foreground/30">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            🎬 حسابات العرض التجريبي
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1.5">
          <div className="flex justify-between gap-4">
            <span className="font-medium">مدير</span>
            <span dir="ltr">admin@aqliya.com / admin123</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-medium">مشغّل</span>
            <span dir="ltr">sara@aqliya.com / operator123</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-medium">مشاهد</span>
            <span dir="ltr">mohammad@aqliya.com / viewer123</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
