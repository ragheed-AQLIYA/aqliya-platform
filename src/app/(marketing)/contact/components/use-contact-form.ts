"use client";

import { useState, useRef } from "react";
import { trackEvent } from "@/lib/tracking";
import { contactFormCopyAr } from "@/lib/marketing/copy-contact";
import { contactFormCopyEn } from "@/lib/marketing/copy-contact-en";

export type ContactFormData = {
  name: string;
  email: string;
  organization: string;
  role: string;
  interest: string;
  message: string;
  product: string;
  dataType: string;
  currentWorkflow: string;
  goal: string;
};

export type FormCopy = {
  title: string;
  subtitle: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  defaultGoal: string;
};

export const productOptions = [
  "AuditOS",
  "LocalContentOS",
  "DecisionOS",
  "Office AI Assistant",
  "غير متأكد  أحتاج توجيهًا",
];

export const dataOptions = [
  "بيانات مالية (ميزان مراجعة، قوائم)",
  "بيانات محتوى محلي (موردين، عقود)",
  "بيانات قرارات مؤسسية",
  "بيانات معرفة داخلية ووثائق",
  "غير محدد  سأناقشه مع الفريق",
];

const initialState: ContactFormData = {
  name: "",
  email: "",
  organization: "",
  role: "",
  interest: "",
  message: "",
  product: "",
  dataType: "",
  currentWorkflow: "",
  goal: "",
};

export function useContactForm(locale: "ar" | "en") {
  const copy = locale === "en" ? contactFormCopyEn : contactFormCopyAr;

  const [form, setForm] = useState<ContactFormData>(initialState);
  const [showDetails, setShowDetails] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const handleChange = (field: string, value: string) => {
    if (!started.current) {
      started.current = true;
      trackEvent("start_pilot_review_form");
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    trackEvent("submit_pilot_review_form");

    try {
      const res = await fetch("/api/pilot-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          organization: form.organization,
          role: form.role,
          productInterest: form.product || "غير متأكد  أحتاج توجيهًا",
          interest: form.interest,
          useCase: form.message,
          dataType: form.dataType || "غير محدد  سأناقشه مع الفريق",
          currentWorkflow: form.currentWorkflow,
          goal: form.goal || copy.form.defaultGoal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setSent(true);
      trackEvent("pilot_review_form_success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع.";
      setError(msg);
      trackEvent("pilot_review_form_error");
    } finally {
      setSubmitting(false);
    }
  };

  const isAr = locale === "ar";

  return {
    form,
    showDetails,
    setShowDetails,
    sent,
    submitting,
    error,
    handleChange,
    handleSubmit,
    copy,
    isAr,
  };
}
