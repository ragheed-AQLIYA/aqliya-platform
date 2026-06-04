"use server";

// ─── SSO Admin Server Actions ───
// Server Actions for managing SSO provider configurations.
// All mutations logged to PlatformAuditLog.

import "server-only";
import { getCurrentUser } from "@/lib/auth";
import {
  getSsoProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  getProviderById,
} from "@/lib/auth/sso-service";
import { isSupportedProvider } from "@/lib/auth/sso-providers";
import { revalidatePath } from "next/cache";

export interface SsoProviderFormData {
  providerType: string;
  label: string;
  clientId?: string;
  clientSecret?: string;
  issuerUrl?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  jwksUri?: string;
  samlEntryPoint?: string;
  samlIssuer?: string;
  samlCert?: string;
  domains?: string[];
  enabled?: boolean;
  attributeMapping?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export async function listSsoProvidersAction() {
  const user = await getCurrentUser();
  return getSsoProviders(user.organizationId);
}

export async function createSsoProviderAction(data: SsoProviderFormData) {
  const user = await getCurrentUser();

  if (!data.providerType) {
    throw new Error("نوع المزود مطلوب");
  }

  if (!data.label) {
    throw new Error("الاسم التعريفي للمزود مطلوب");
  }

  const provider = await createProvider(
    user.organizationId,
    {
      providerType: data.providerType,
      label: data.label,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      issuerUrl: data.issuerUrl,
      authorizationUrl: data.authorizationUrl,
      tokenUrl: data.tokenUrl,
      userInfoUrl: data.userInfoUrl,
      jwksUri: data.jwksUri,
      samlEntryPoint: data.samlEntryPoint,
      samlIssuer: data.samlIssuer,
      samlCert: data.samlCert,
      domains: data.domains,
      enabled: data.enabled ?? true,
      metadata: data.metadata,
    },
    user.id,
  );

  revalidatePath("/settings/sso");
  return provider;
}

export async function updateSsoProviderAction(
  providerId: string,
  data: Partial<SsoProviderFormData>,
) {
  const user = await getCurrentUser();

  const updated = await updateProvider(
    user.organizationId,
    providerId,
    {
      label: data.label,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      issuerUrl: data.issuerUrl,
      authorizationUrl: data.authorizationUrl,
      tokenUrl: data.tokenUrl,
      userInfoUrl: data.userInfoUrl,
      jwksUri: data.jwksUri,
      samlEntryPoint: data.samlEntryPoint,
      samlIssuer: data.samlIssuer,
      samlCert: data.samlCert,
      domains: data.domains,
      enabled: data.enabled,
      metadata: data.metadata,
    },
    user.id,
  );

  if (!updated) {
    throw new Error("مزود الدخول الموحد غير موجود");
  }

  revalidatePath("/settings/sso");
  return updated;
}

export async function deleteSsoProviderAction(providerId: string) {
  const user = await getCurrentUser();

  const deleted = await deleteProvider(user.organizationId, providerId, user.id);
  if (!deleted) {
    throw new Error("مزود الدخول الموحد غير موجود");
  }

  revalidatePath("/settings/sso");
}

export async function toggleSsoProviderAction(
  providerId: string,
  enabled: boolean,
) {
  const user = await getCurrentUser();

  const updated = await updateProvider(
    user.organizationId,
    providerId,
    { enabled },
    user.id,
  );

  if (!updated) {
    throw new Error("مزود الدخول الموحد غير موجود");
  }

  revalidatePath("/settings/sso");
  return updated;
}

export async function getSsoProviderAction(providerId: string) {
  const user = await getCurrentUser();
  return getProviderById(user.organizationId, providerId);
}

export async function testSsoProviderConfigAction(providerType: string) {
  const providerEnvMap: Record<string, { idVar: string; secretVar: string; extraVars?: string[] }> = {
    google: { idVar: "AUTH_GOOGLE_ID", secretVar: "AUTH_GOOGLE_SECRET" },
    github: { idVar: "AUTH_GITHUB_ID", secretVar: "AUTH_GITHUB_SECRET" },
    "azure-ad": {
      idVar: "AUTH_AZURE_AD_ID",
      secretVar: "AUTH_AZURE_AD_SECRET",
      extraVars: ["AUTH_AZURE_AD_TENANT_ID"],
    },
    okta: {
      idVar: "AUTH_OKTA_ID",
      secretVar: "AUTH_OKTA_SECRET",
      extraVars: ["AUTH_OKTA_ISSUER"],
    },
    "custom-oidc": { idVar: "", secretVar: "" },
    saml: { idVar: "", secretVar: "" },
  };

  const mapping = providerEnvMap[providerType];

  if (!mapping) {
    return {
      success: false,
      message: `نوع المزود "${providerType}" غير معروف`,
    };
  }

  if (providerType === "custom-oidc" || providerType === "saml") {
    return {
      success: true,
      message: "يتم التحقق من الإعدادات من قاعدة البيانات. تأكد من إدخال البيانات بشكل صحيح.",
    };
  }

  const missingVars: string[] = [];
  if (mapping.idVar && !process.env[mapping.idVar]) {
    missingVars.push(mapping.idVar);
  }
  if (mapping.secretVar && !process.env[mapping.secretVar]) {
    missingVars.push(mapping.secretVar);
  }
  if (mapping.extraVars) {
    for (const v of mapping.extraVars) {
      if (!process.env[v]) {
        missingVars.push(v);
      }
    }
  }

  if (missingVars.length > 0) {
    return {
      success: false,
      message: `المتغيرات البيئية التالية غير مضبوطة: ${missingVars.join(", ")}`,
    };
  }

  return {
    success: true,
    message: "جميع المتغيرات البيئية مضبوطة بشكل صحيح",
  };
}
