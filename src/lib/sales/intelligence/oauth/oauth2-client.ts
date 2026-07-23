/**
 * OAuth2 3-Legged Client — Authorization Code Grant with PKCE
 *
 * Supports: LinkedIn, Google, Microsoft, and custom OAuth2 providers.
 * Used by connectors that require user authorization (not just API keys).
 */
import "server-only";
import { createHash, randomBytes } from "crypto";

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  usePkce?: boolean;
  state?: string;
}

export interface OAuth2Tokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: Date;
  tokenType: string;
  scope: string;
}

export interface AuthorizationUrlResult {
  url: string;
  state: string;
  codeVerifier?: string;
}

// ── PKCE Helpers ──

function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

function generateState(): string {
  return randomBytes(16).toString("hex");
}

// ── Authorization URL Generation ──

export function buildAuthorizationUrl(
  config: OAuth2Config,
): AuthorizationUrlResult {
  const state = config.state ?? generateState();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    state,
  });

  let codeVerifier: string | undefined;

  if (config.usePkce !== false) {
    codeVerifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(codeVerifier);
    params.set("code_challenge", challenge);
    params.set("code_challenge_method", "S256");
  }

  return {
    url: `${config.authorizationUrl}?${params.toString()}`,
    state,
    codeVerifier,
  };
}

// ── Token Exchange ──

export async function exchangeCodeForTokens(
  config: OAuth2Config,
  code: string,
  codeVerifier?: string,
): Promise<OAuth2Tokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  if (codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OAuth2 token exchange failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
    tokenType: data.token_type,
    scope: data.scope,
  };
}

// ── Token Refresh ──

export async function refreshAccessToken(
  config: OAuth2Config,
  refreshToken: string,
): Promise<OAuth2Tokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(
      `OAuth2 token refresh failed: ${response.status}`,
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
    tokenType: data.token_type,
    scope: data.scope,
  };
}

// ── Provider Configs ──

export const OAUTH2_PROVIDERS: Record<string, OAuth2Config> = {
  linkedin: {
    clientId: "", // Set via env var
    clientSecret: "", // Set via env var
    redirectUri: "", // Set dynamically
    authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "email", "r_organization_social"],
    usePkce: true,
  },
  google: {
    clientId: "",
    clientSecret: "",
    redirectUri: "",
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["openid", "profile", "email"],
    usePkce: true,
  },
  microsoft: {
    clientId: "",
    clientSecret: "",
    redirectUri: "",
    authorizationUrl:
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: ["openid", "profile", "email", "offline_access"],
    usePkce: true,
  },
};
