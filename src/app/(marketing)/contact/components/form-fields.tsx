"use client";

import type { ContactFormData } from "./use-contact-form";
import { OptionalDetails } from "./optional-details";

type Props = {
  isAr: boolean;
  form: ContactFormData;
  handleChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
  submitting: boolean;
  sent: boolean;
  error: string | null;
  interestOptions: readonly string[];
  copy: {
    submitting: string;
    submit: string;
  };
};

export function FormFields({
  isAr,
  form,
  handleChange,
  handleSubmit,
  showDetails,
  setShowDetails,
  submitting,
  sent,
  error,
  interestOptions,
  copy,
}: Props) {
  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-white">
            {isAr ? "الاسم الكامل" : "Full name"}
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-white">
            {isAr ? "البريد الإلكتروني" : "Email"}
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="organization" className="mb-1 block text-sm font-medium text-white">
          {isAr ? "الجهة / المؤسسة" : "Organization"}
        </label>
        <input
          id="organization"
          type="text"
          required
          value={form.organization}
          onChange={(e) => handleChange("organization", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
        />
      </div>

      <div>
        <label htmlFor="interest" className="mb-1 block text-sm font-medium text-white">
          {isAr ? "نوع الطلب" : "Request type"}
        </label>
        <select
          id="interest"
          required
          value={form.interest}
          onChange={(e) => handleChange("interest", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
        >
          <option value="" disabled className="bg-gray-900">
            {isAr ? "اختر نوع الطلب..." : "Select request type..."}
          </option>
          {interestOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-gray-900">
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-white">
          {isAr ? "رسالة مختصرة  ما الذي تريد تقييمه؟" : "Short message  what do you want to evaluate?"}
        </label>
        <textarea
          id="message"
          required
          rows={3}
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
          placeholder={
            isAr
              ? "مثال: مكتب مراجعة  تدقيق IFRS على ارتباط واحد..."
              : "Example: audit firm  IFRS review on one engagement..."
          }
        />
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm font-medium text-aqliya-cyan hover:text-cyan-300 transition-colors"
      >
        {showDetails
          ? isAr
            ? "− إخفاء التفاصيل الإضافية"
            : "− Hide optional details"
          : isAr
            ? "+ تفاصيل إضافية (اختياري)"
            : "+ Optional details"}
      </button>

      {showDetails && (
        <OptionalDetails isAr={isAr} form={form} handleChange={handleChange} />
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={sent || submitting}
        className="btn-primary h-12 w-full disabled:opacity-50"
      >
        {submitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
