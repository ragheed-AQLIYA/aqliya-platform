"use client";

import { publicEngagementGate, publicEngagementGateEn } from "@/lib/marketing/public-status";

export function useStartHub(locale: "ar" | "en") {
  const gate = locale === "en" ? publicEngagementGateEn : publicEngagementGate;
  const proofHref = locale === "en" ? "/en/proof" : "/proof";
  const useCasesHref = locale === "en" ? "/en/use-cases" : "/use-cases";

  return { gate, proofHref, useCasesHref };
}
