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
import { Separator } from "@/components/ui/separator";
import type { AvailableProvider, SamlLoginProvider } from "@/actions/sso-login-actions";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  "azure-ad": "Azure AD",
  okta: "Okta",
};

export default function LoginPage() {
  const [justRegistered, setJustRegistered] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [ssoProviders, setSsoProviders] = useState<AvailableProvider[]>([]);
  const [samlProviders, setSamlProviders] = useState<SamlLoginProvider[]>([]);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [ssoError, setSsoError] = useState("");

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    setJustRegistered(params.get("registered") === "true");
    const authError = params.get("error");
    if (authError === "CredentialsSignin") {
      setError("بريد إلكتروني أو كلمة مرور غير صحيحة");
    } else if (authError) {
      setError("فشل تسجيل الدخول. حاول مرة أخرى.");
    }
    loadSsoProviders();
  }, []);

  async function loadSsoProviders() {
    try {
      const { getAvailableSsoProvidersAction, getAvailableSamlProvidersAction } = await import(
        "@/actions/sso-login-actions"
      );
      const [oauthProviders, samlList] = await Promise.all([
        getAvailableSsoProvidersAction(),
        getAvailableSamlProvidersAction(),
      ]);
      setSsoProviders(oauthProviders);
      setSamlProviders(samlList);
    } catch {
      // SSO providers check failed silently
    }
  }

  async function handleSsoSignIn(providerId: string) {
    setSsoLoading(providerId);
    setSsoError("");
    try {
      const url = new URL(window.location.href);
      const rawCallback = url.searchParams.get("callbackUrl") || "/";
      const callbackUrl =
        rawCallback.startsWith("/") && !rawCallback.startsWith("//")
          ? rawCallback
          : "/";
      await signIn(providerId, { callbackUrl });
    } catch {
      setSsoError("فشل تسجيل الدخول عبر المزود الخارجي");
      setSsoLoading(null);
    }
  }

  function handleSamlSignIn(dbProviderId: string) {
    setSsoLoading(`saml-${dbProviderId}`);
    setSsoError("");
    const url = new URL(window.location.href);
    const rawCallback = url.searchParams.get("callbackUrl") || "/";
    const callbackUrl =
      rawCallback.startsWith("/") && !rawCallback.startsWith("//")
        ? rawCallback
        : "/";
    window.location.href = `/api/auth/saml/${dbProviderId}/initiate?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }

  function fillDemoAccount(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const url = new URL(window.location.href);
      const rawCallback = url.searchParams.get("callbackUrl") || "/audit";
      const callbackUrl =
        rawCallback.startsWith("/") && !rawCallback.startsWith("//")
          ? rawCallback
          : "/audit";

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(
          normalizedEmail === "admin@aqliya.com"
            ? "بيانات الدخول غير صحيحة. للحساب التجريبي استخدم admin123 (انقر «مدير» بالأسفل للتعبئة التلقائية)."
            : "بريد إلكتروني أو كلمة مرور غير صحيحة",
        );
        setLoading(false);
        return;
      }

      if (result?.ok) {
        setRedirecting(true);
        window.location.href = callbackUrl;
        return;
      }

      setError("تم تسجيل الدخول ولكن الجلسة لم تُنشأ. حاول مرة أخرى.");
      setLoading(false);
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

          {(ssoProviders.length > 0 || samlProviders.length > 0) && (
            <>
              <div className="relative my-4">
                <Separator />
                <span className="absolute inset-x-0 -top-2.5 mx-auto w-fit bg-card px-2 text-xs text-muted-foreground">
                  أو الدخول عبر
                </span>
              </div>

              <div className="space-y-2">
                {ssoProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleSsoSignIn(provider.id)}
                    disabled={ssoLoading !== null}
                  >
                    {ssoLoading === provider.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                        {PROVIDER_LABELS[provider.id]?.charAt(0) || "O"}
                      </span>
                    )}
                    {PROVIDER_LABELS[provider.id] || provider.label}
                  </Button>
                ))}

                {samlProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleSamlSignIn(provider.providerId)}
                    disabled={ssoLoading !== null}
                  >
                    {ssoLoading === provider.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                        S
                      </span>
                    )}
                    {provider.label}
                  </Button>
                ))}
              </div>

              {ssoError && (
                <p className="mt-2 text-sm text-destructive">{ssoError}</p>
              )}
            </>
          )}

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
          <button
            type="button"
            className="flex w-full justify-between gap-4 rounded-md px-2 py-1.5 text-start transition-colors hover:bg-muted"
            onClick={() => fillDemoAccount("admin@aqliya.com", "admin123")}
          >
            <span className="font-medium">مدير</span>
            <span dir="ltr">admin@aqliya.com / admin123</span>
          </button>
          <button
            type="button"
            className="flex w-full justify-between gap-4 rounded-md px-2 py-1.5 text-start transition-colors hover:bg-muted"
            onClick={() =>
              fillDemoAccount("sara@aqliya.com", "operator123")
            }
          >
            <span className="font-medium">مشغّل</span>
            <span dir="ltr">sara@aqliya.com / operator123</span>
          </button>
          <button
            type="button"
            className="flex w-full justify-between gap-4 rounded-md px-2 py-1.5 text-start transition-colors hover:bg-muted"
            onClick={() =>
              fillDemoAccount("mohammad@aqliya.com", "viewer123")
            }
          >
            <span className="font-medium">مشاهد</span>
            <span dir="ltr">mohammad@aqliya.com / viewer123</span>
          </button>
          <p className="pt-1 text-center text-[10px]">
            انقر أي صف لتعبئة البريد وكلمة المرور تلقائياً
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
