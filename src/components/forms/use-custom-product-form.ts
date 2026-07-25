"use client";

import { useState, useCallback } from "react";
import type { FormData, FormStatus, FormErrors } from "./constants";
import { initialData, buildMailtoLink } from "./constants";

export function useCustomProductForm() {
  const [data, setData] = useState<FormData>(initialData);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FormErrors>({});

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const toggleArray = useCallback(
    (key: "challenges" | "environment" | "outcomes", id: string) => {
      setData((prev) => ({
        ...prev,
        [key]: prev[key].includes(id)
          ? prev[key].filter((x) => x !== id)
          : [...prev[key], id],
      }));
    },
    [],
  );

  function validate(): boolean {
    const e: FormErrors = {};
    if (!data.orgName.trim()) e.orgName = "مطلوب";
    if (!data.industry) e.industry = "مطلوب";
    if (!data.orgSize) e.orgSize = "مطلوب";
    if (!data.country) e.country = "مطلوب";
    if (!data.systemCategory) e.systemCategory = "اختر نوع النظام";
    if (!data.intent) e.intent = "مطلوب";
    if (!data.contactName.trim()) e.contactName = "مطلوب";
    if (!data.contactEmail.trim()) e.contactEmail = "مطلوب";
    if (!data.contactPhone.trim()) e.contactPhone = "مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/custom-product-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error("Submission failed");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleMailtoFallback() {
    window.location.href = buildMailtoLink(data);
  }

  return {
    data,
    status,
    errors,
    update,
    toggleArray,
    handleSubmit,
    handleMailtoFallback,
  };
}
