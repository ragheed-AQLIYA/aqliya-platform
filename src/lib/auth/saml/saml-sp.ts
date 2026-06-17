// ─── SAML Service Provider Helper ───
// Wraps @node-saml/node-saml per-provider.
// Used by the SAML API routes (initiate / callback / metadata).
// MUST be server-only — never import from Client Components.

import "server-only";

import { SAML, generateServiceProviderMetadata, ValidateInResponseTo } from "@node-saml/node-saml";
import type { SsoProviderResponse } from "@/lib/auth/sso-service";

// ─── Types ───

export interface SamlProfile {
  email: string;
  name: string | null;
  nameID: string;
  nameIDFormat: string;
  sessionIndex?: string;
}

export interface SamlValidationResult {
  profile: SamlProfile;
  loggedOut: boolean;
}

// ─── Constants ───

function getAppBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  );
}

function callbackUrl(providerId: string): string {
  return `${getAppBaseUrl()}/api/auth/saml/${providerId}/callback`;
}

// ─── SAML instance factory ───

export function buildSamlInstance(
  provider: SsoProviderResponse,
): SAML | null {
  if (!provider.samlEntryPoint || !provider.samlCert) {
    return null;
  }

  return new SAML({
    entryPoint: provider.samlEntryPoint,
    issuer: provider.samlIssuer || getAppBaseUrl(),
    idpCert: provider.samlCert,
    callbackUrl: callbackUrl(provider.id),
    signatureAlgorithm: "sha256",
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: true,
    validateInResponseTo: ValidateInResponseTo.ifPresent,
  });
}

// ─── AuthnRequest URL ───

export async function getSamlAuthorizeUrl(
  provider: SsoProviderResponse,
  relayState?: string,
): Promise<string | null> {
  const saml = buildSamlInstance(provider);
  if (!saml) return null;

  try {
    return await saml.getAuthorizeUrlAsync(
      relayState ?? "",
      undefined,
      {},
    );
  } catch {
    return null;
  }
}

// ─── Validate POST response from IdP ───

export async function validateSamlResponse(
  provider: SsoProviderResponse,
  samlResponseBody: string,
): Promise<SamlValidationResult> {
  const saml = buildSamlInstance(provider);
  if (!saml) {
    throw new Error("SAML provider not configured (missing cert or entryPoint)");
  }

  const result = await saml.validatePostResponseAsync({
    SAMLResponse: samlResponseBody,
  });

  const rawProfile = result.profile;

  if (!rawProfile) {
    throw new Error("SAML response contained no profile");
  }

  // Normalize email — try common attribute paths
  const email: string =
    (rawProfile as Record<string, unknown>)["email"] as string ||
    (rawProfile as Record<string, unknown>)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string ||
    rawProfile.nameID ||
    "";

  if (!email || !email.includes("@")) {
    throw new Error("SAML response did not contain a valid email address");
  }

  const name: string | null =
    (rawProfile as Record<string, unknown>)["displayName"] as string ||
    (rawProfile as Record<string, unknown>)["http://schemas.microsoft.com/identity/claims/displayname"] as string ||
    (rawProfile as Record<string, unknown>)["name"] as string ||
    null;

  return {
    profile: {
      email: email.toLowerCase(),
      name,
      nameID: rawProfile.nameID,
      nameIDFormat: rawProfile.nameIDFormat ?? "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
      sessionIndex: (rawProfile as Record<string, unknown>)["sessionIndex"] as string | undefined,
    },
    loggedOut: result.loggedOut,
  };
}

// ─── SP Metadata XML ───

export function getSamlSpMetadataXml(
  provider: SsoProviderResponse,
): string | null {
  if (!provider.samlEntryPoint || !provider.samlCert) {
    return null;
  }

  try {
    return generateServiceProviderMetadata({
      issuer: provider.samlIssuer || getAppBaseUrl(),
      callbackUrl: callbackUrl(provider.id),
    });
  } catch {
    return null;
  }
}
