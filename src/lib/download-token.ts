// ─── Signed Download Tokens ───
// HMAC-SHA256 signed tokens for expiring download URLs.
// Uses Web Crypto API (Edge + Node.js compatible).
// No external dependencies beyond what Next.js provides.

const TOKEN_EXPIRY_MINUTES = 5;
const ALGORITHM = { name: "HMAC", hash: "SHA-256" };

function getSecret(): Uint8Array {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret) {
    throw new Error("DOWNLOAD_TOKEN_SECRET must be set");
  }
  return new TextEncoder().encode(secret);
}

function base64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = 4 - (base64.length % 4);
  const padded = padding < 4 ? base64 + "=".repeat(padding) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importKey(secret: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    secret as unknown as ArrayBuffer,
    ALGORITHM,
    false,
    ["sign", "verify"],
  );
}

export interface DownloadTokenPayload {
  sub: string;
  org: string;
  type: string;
  file: string;
  exp: number;
  iat: number;
}

export async function signDownloadToken(params: {
  userId: string;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  expiresInMinutes?: number;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: DownloadTokenPayload = {
    sub: params.userId,
    org: params.organizationId,
    type: params.resourceType,
    file: params.resourceId,
    exp: now + (params.expiresInMinutes ?? TOKEN_EXPIRY_MINUTES) * 60,
    iat: now,
  };

  const secret = getSecret();
  const key = await importKey(secret);
  const payloadStr = JSON.stringify(payload);
  const payloadBuf = new TextEncoder().encode(payloadStr);
  const payloadEncoded = base64url(payloadBuf);
  const signature = await crypto.subtle.sign(
    ALGORITHM,
    key,
    payloadBuf as unknown as ArrayBuffer,
  );
  const sigEncoded = base64url(signature);

  return `${payloadEncoded}.${sigEncoded}`;
}

export async function verifyDownloadToken(
  token: string,
): Promise<DownloadTokenPayload> {
  const parts = token.split(".");
  if (parts.length !== 2) {
    throw new Error("Invalid token format");
  }

  const [payloadEncoded, sigEncoded] = parts;
  const payloadBytes = base64urlDecode(payloadEncoded);
  const payloadStr = new TextDecoder().decode(payloadBytes);

  const secret = getSecret();
  const key = await importKey(secret);

  // Constant-time HMAC verification via Web Crypto. Avoids the timing
  // side-channel of manually comparing signature strings with !==.
  const signatureBytes = base64urlDecode(sigEncoded);
  const isValid = await crypto.subtle.verify(
    ALGORITHM,
    key,
    signatureBytes as unknown as ArrayBuffer,
    payloadBytes as unknown as ArrayBuffer,
  );

  if (!isValid) {
    throw new Error("Invalid token signature");
  }

  const payload: DownloadTokenPayload = JSON.parse(payloadStr);
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp < now) {
    throw new Error("Download token has expired");
  }

  return payload;
}
