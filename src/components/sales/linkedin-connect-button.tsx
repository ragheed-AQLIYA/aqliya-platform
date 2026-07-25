"use client";

import { createLogger } from "@/lib/observability/logger";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Loader2 } from "lucide-react";


const logger = createLogger({ product: "platform", action: "unknown" });

export function LinkedInConnectButton() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ?? "";
      const redirectUri = `${window.location.origin}/api/sales/intel/oauth/callback?provider=linkedin`;

      if (!clientId) {
        alert("يجب تعيين NEXT_PUBLIC_LINKEDIN_CLIENT_ID في متغيرات البيئة");
        setLoading(false);
        return;
      }

      // Build OAuth URL directly in client (no server-only dependency)
      const state = `org-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "openid profile email r_organization_social",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });

      sessionStorage.setItem("linkedin_code_verifier", codeVerifier);
      sessionStorage.setItem("linkedin_oauth_state", state);

      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    } catch (err) {
      logger.error("LinkedIn OAuth error:", err instanceof Error ? err : undefined);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-2" dir="rtl">
      <Button
        variant={connected ? "outline" : "default"}
        size="sm"
        onClick={handleConnect}
        disabled={loading || connected}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        {connected ? "✓ متصل بـ LinkedIn" : "ربط LinkedIn"}
      </Button>

      {connected && (
        <p className="text-xs text-green-600">
          تم ربط حساب LinkedIn بنجاح. سيتم استخدامه لإثراء بيانات الشركات وجهات
          الاتصال.
        </p>
      )}

      {!connected && (
        <p className="text-xs text-muted-foreground">
          اربط حساب LinkedIn للوصول إلى بيانات الشركات والملفات الشخصية بشكل آمن
          عبر OAuth 2.0.
        </p>
      )}
    </div>
  );
}

// PKCE helpers (client-safe, no server-only dependency)
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
