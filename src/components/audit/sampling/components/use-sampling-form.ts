"use client";

import { useState } from "react";
import type { SamplingMethod, SamplingResult } from "@/lib/audit/sampling";
import { generateAuditSamplingAction } from "@/actions/audit-actions";

export function useSamplingForm(engagementId: string) {
  const [result, setResult] = useState<SamplingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [method, setMethod] = useState<SamplingMethod>("random");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const selectedMethod =
        (formData.get("method") as SamplingMethod) ?? "random";
      const generated = await generateAuditSamplingAction({
        engagementId,
        method: selectedMethod,
        sampleSize: Number(formData.get("sampleSize") ?? 10),
        seed: (formData.get("seed") as string) || undefined,
        materialityThreshold: formData.get("materialityThreshold")
          ? Number(formData.get("materialityThreshold"))
          : undefined,
        confidenceLevel: formData.get("confidenceLevel")
          ? Number(formData.get("confidenceLevel"))
          : undefined,
        marginOfError: formData.get("marginOfError")
          ? Number(formData.get("marginOfError"))
          : undefined,
        interval: formData.get("interval")
          ? Number(formData.get("interval"))
          : undefined,
        randomStart: formData.get("randomStart")
          ? Number(formData.get("randomStart"))
          : undefined,
      });
      setResult(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر توليد العينة");
      setResult(null);
    } finally {
      setPending(false);
    }
  }

  return { result, error, pending, method, setMethod, handleSubmit };
}
