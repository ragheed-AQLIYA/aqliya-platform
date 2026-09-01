// ─── SCIM API Auth Helper ───
// Validates Bearer token for SCIM API endpoints.
// Per-org keys via SCIM_ORG_KEYS; fallback SCIM_API_KEY + SCIM_DEFAULT_ORG_ID.

import { NextResponse } from "next/server";
import { buildScimError } from "@/lib/auth/scim-types";
import crypto from "crypto";

export interface ScimAuthResult {
  authenticated: boolean;
  organizationId: string | null;
  response?: NextResponse;
}

function sha256(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

function secretsEqual(provided: string, expected: string): boolean {
  return crypto.timingSafeEqual(sha256(provided), sha256(expected));
}

function parseOrgKeys(): Array<{ organizationId: string; key: string }> {
  const raw = process.env.SCIM_ORG_KEYS?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed)
        .filter(([, key]) => typeof key === "string" && key.length > 0)
        .map(([organizationId, key]) => ({
          organizationId,
          key: key as string,
        }));
    }
  } catch {
    // fall through to orgId=key pairs
  }
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf("=");
      if (eq <= 0) return null;
      return {
        organizationId: part.slice(0, eq).trim(),
        key: part.slice(eq + 1).trim(),
      };
    })
    .filter((row): row is { organizationId: string; key: string } =>
      Boolean(row?.organizationId && row.key),
    );
}

export function authenticateScimRequest(request: Request): ScimAuthResult {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      organizationId: null,
      response: NextResponse.json(
        buildScimError(401, "Missing or invalid Authorization header. Use: Bearer <token>"),
        { status: 401, headers: { "Content-Type": "application/scim+json" } },
      ),
    };
  }

  const token = authHeader.slice(7);
  const mapped = parseOrgKeys();
  for (const entry of mapped) {
    if (secretsEqual(token, entry.key)) {
      return { authenticated: true, organizationId: entry.organizationId };
    }
  }

  const scimApiKey = process.env.SCIM_API_KEY;
  if (scimApiKey && secretsEqual(token, scimApiKey)) {
    const organizationId =
      process.env.SCIM_DEFAULT_ORG_ID || process.env.SSO_DEFAULT_ORG_ID || "";
    if (!organizationId) {
      return {
        authenticated: false,
        organizationId: null,
        response: NextResponse.json(
          buildScimError(500, "SCIM is not configured: no default organization ID set"),
          { status: 500, headers: { "Content-Type": "application/scim+json" } },
        ),
      };
    }
    return { authenticated: true, organizationId };
  }

  return {
    authenticated: false,
    organizationId: null,
    response: NextResponse.json(
      buildScimError(401, "Invalid SCIM API key"),
      { status: 401, headers: { "Content-Type": "application/scim+json" } },
    ),
  };
}

export function getScimHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/scim+json",
  };
}
