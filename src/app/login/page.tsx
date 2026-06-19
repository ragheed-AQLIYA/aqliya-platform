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
  // Lazy initialisers read URL params once on first render — avoids setState inside an effect.
  const [justRegistered] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URL(window.location.href).searchParams.get("registered") === "true";
  });
  // MFA challenge mode: middleware redirects here with ?mfa=true after first-factor login.
  const [isMfaChallenge] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URL(window.location.href).searchParams.get("mfa") === "true";
  });
  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const authError = new URL(window.location.href).searchParams.get("error");
    if (authError === "CredentialsSignin") return "بريد إلكتروني أو كلمة مرور غير صحيحة";
    if (authError) return "فشل تسجيل الدخول. حاول مرة أخرى.";
    return "";
  });
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [ssoProviders, setSsoProviders] = useState<AvailableProvider[]>([]);
  const [samlProviders, setSamlProviders] = useState<SamlLoginProvider[]>([]);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [ssoError, setSsoError] = useState("");

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

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { loadSsoProviders(); }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("error")) return;
    url.searchParams.delete("error");
    const qs = url.searchParams.toString();
    window.history.replaceState(
      {},
      "",
      qs ? `${url.pathname}?${qs}` : url.pathname,
    );
    setError("");
  }, []);

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
    // eslint-disable-next-line react-hooks/immutability
    window.location.href = `/api/auth/saml/${dbProviderId}/initiate?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }

  async function handleMfaVerify(e: React.FormEvent) {
    e.preventDefault();
    setMfaLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mfaCode }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "رمز التحقق غير صحيح");
        setMfaLoading(false);
        return;
      }
      const url = new URL(window.location.href);
      const raw = url.searchParams.get("callbackUrl") || "/audit";
      const dest = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/audit";
      setRedirecting(true);
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = dest;
    } catch {
      setError("حدث خطأ في الاتصال. حاول مرة أخرى.");
      setMfaLoading(false);
    }
  }


  async function performLogin(loginEmail: string, loginPassword: string) {
    setLoading(true);
    setError("");

    const normalizedEmail = loginEmail.trim().toLowerCase();

    try {
      const url = new URL(window.location.href);
      const rawCallback = url.searchParams.get("callbackUrl") || "/audit";
      const callbackUrl =
        rawCallback.startsWith("/") && !rawCallback.startsWith("//")
          ? rawCallback
          : "/audit";

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password: loginPassword,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(
          normalizedEmail === "admin@aqliya.com"
            ? "بيانات الدخول غير صحيحة. شغّل: npm run ensure:admin ثم أعد تشغيل السيرفر — أو انقر «مدير» للدخول التلقائي."
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

  async function handleDemoLogin(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    await performLogin(demoEmail, demoPassword);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const formEmail = String(fd.get("email") ?? "").trim();
    const formPassword = String(fd.get("password") ?? "");
    await performLogin(formEmail || email, formPassword || password);
  }

  // ── MFA Challenge View ──────────────────────────────────────────────
  if (isMfaChallenge) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center p-8"
        dir="rtl"
      >
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>التحقق بعاملين (MFA)</CardTitle>
            <CardDescription>
              أدخل رمز التحقق من تطبيق المصادقة الخاص بك.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfaCode">رمز التحقق</Label>
                <Input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                  dir="ltr"
                  className="text-center tracking-widest text-lg"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {redirecting && (
                <p className="text-sm text-muted-foreground">جارٍ التوجيه...</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={mfaLoading || redirecting || mfaCode.length < 6}
              >
                {mfaLoading ? "جارٍ التحقق..." : "تأكيد الرمز"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              جلستك نشطة. أدخل رمز تطبيق المصادقة للمتابعة.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ── Standard Login View ──────────────────────────────────────────────
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
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
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
            className="flex w-full justify-between gap-4 rounded-md px-2 py-1.5 text-start transition-colors hover:bg-muted disabled:opacity-50"
            disabled={loading || redirecting}
            onClick={() => handleDemoLogin("admin@aqliya.com", "admin123")}
          >
            <span className="font-medium">مدير</span>
            <span dir="ltr">admin@aqliya.com / admin123</span>
          </button>
          <button
            type="button"
            className="flex w-full justify-between gap-4 rounded-md px-2 py-1.5 text-start transition-colors hover:bg-muted disabled:opacity-50"
            disabled={loading || redirecting}
            onClick={() =>
              handleDemoLogin("sara@aqliya.com", "operator123")
            }
          >
            <span className="font-medium">مشغّل</span>
            <span dir="ltr">sara@aqliya.com / operator123</span>
          </button>
          <button
            type="button"
            className="flex w-full justify-between gap-4 rounded-md px-2 py-1.5 text-start transition-colors hover:bg-muted disabled:opacity-50"
            disabled={loading || redirecting}
            onClick={() =>
              handleDemoLogin("mohammad@aqliya.com", "viewer123")
            }
          >
            <span className="font-medium">مشاهد</span>
            <span dir="ltr">mohammad@aqliya.com / viewer123</span>
          </button>
          <p className="pt-1 text-center text-[10px]">
            انقر أي صف لتسجيل الدخول مباشرة (حسابات العرض التجريبي)
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
