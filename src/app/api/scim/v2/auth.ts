// ─── SCIM API Auth Helper ───
// Validates Bearer token for SCIM API endpoints.
// Looks up the organization from the API key and returns organizationId.

import { NextResponse } from "next/server";
import { buildScimError } from "@/lib/auth/scim-types";
import crypto from "crypto";

export interface ScimAuthResult {
  authenticated: boolean;
  organizationId: string | null;
  response?: NextResponse;
}

export function authenticateScimRequest(request: Request): ScimAuthResult {
  const scimApiKey = process.env.SCIM_API_KEY;
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

  if (!scimApiKey || token.length !== scimApiKey.length || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(scimApiKey))) {
    return {
      authenticated: false,
      organizationId: null,
      response: NextResponse.json(
        buildScimError(401, "Invalid SCIM API key"),
        { status: 401, headers: { "Content-Type": "application/scim+json" } },
      ),
    };
  }

  // Use default org from env, or could be mapped from API key in future
  const organizationId = process.env.SCIM_DEFAULT_ORG_ID || process.env.SSO_DEFAULT_ORG_ID || "";

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

export function getScimHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/scim+json",
  };
}
