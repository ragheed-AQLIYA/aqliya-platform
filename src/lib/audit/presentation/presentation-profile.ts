/**
 * Engagement-level Income Statement presentation profile — single source of truth.
 * Phase 13.1: replaces global AUDITOS_IS_PRESENTATION_PROFILE env var.
 */

export enum PresentationProfile {
  GENERIC = "generic",
  PILOT_AUDITED = "pilot-audited",
}

export const PRESENTATION_PROFILE_VERSIONS: Record<PresentationProfile, string> =
  {
    [PresentationProfile.GENERIC]: "generic-v1",
    [PresentationProfile.PILOT_AUDITED]: "pilot-audited-v1",
  };

export const DEFAULT_PRESENTATION_PROFILE = PresentationProfile.GENERIC;

export type EngagementPresentationConfig = {
  presentationProfile: PresentationProfile;
  presentationProfileVersion: string;
};

/** Normalize stored / API values; null and unknown → generic. */
export function resolvePresentationProfile(
  value: string | null | undefined,
): PresentationProfile {
  const normalized = value?.trim().toLowerCase();
  if (
    normalized === PresentationProfile.PILOT_AUDITED ||
    normalized === "pilot"
  ) {
    return PresentationProfile.PILOT_AUDITED;
  }
  if (
    normalized === PresentationProfile.GENERIC ||
    normalized === "general"
  ) {
    return PresentationProfile.GENERIC;
  }
  return DEFAULT_PRESENTATION_PROFILE;
}

export function presentationProfileVersionFor(
  profile: PresentationProfile,
): string {
  return PRESENTATION_PROFILE_VERSIONS[profile];
}

export function resolvePresentationProfileVersion(
  profile: PresentationProfile,
  storedVersion: string | null | undefined,
): string {
  const trimmed = storedVersion?.trim();
  if (trimmed) return trimmed;
  return presentationProfileVersionFor(profile);
}

export function isPilotAuditedProfile(profile: PresentationProfile): boolean {
  return profile === PresentationProfile.PILOT_AUDITED;
}

export function resolveEngagementPresentationConfig(
  engagement:
    | {
        presentationProfile?: string | null;
        presentationProfileVersion?: string | null;
      }
    | null
    | undefined,
): EngagementPresentationConfig {
  const presentationProfile = resolvePresentationProfile(
    engagement?.presentationProfile,
  );
  return {
    presentationProfile,
    presentationProfileVersion: resolvePresentationProfileVersion(
      presentationProfile,
      engagement?.presentationProfileVersion,
    ),
  };
}

export const PRESENTATION_PROFILE_LABELS: Record<
  PresentationProfile,
  { en: string; ar: string }
> = {
  [PresentationProfile.GENERIC]: {
    en: "Generic",
    ar: "عام",
  },
  [PresentationProfile.PILOT_AUDITED]: {
    en: "Pilot Audited",
    ar: "محاذاة التدقيق (تجريبي)",
  },
};
