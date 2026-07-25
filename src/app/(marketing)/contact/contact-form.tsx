"use client";

import { useContactForm } from "./components/use-contact-form";
import { Sidebar } from "./components/sidebar";
import { FormSuccess } from "./components/form-success";
import { FormFields } from "./components/form-fields";
import { productOptions, dataOptions } from "./components/use-contact-form";
import type { FormCopy } from "./components/use-contact-form";

type Props = {
  locale?: "ar" | "en";
};

export function ContactForm({ locale = "ar" }: Props) {
  const {
    form, showDetails, setShowDetails, sent, submitting, error,
    handleChange, handleSubmit, copy, isAr,
  } = useContactForm(locale);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
      <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <Sidebar copy={copy.sidebar} />

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <h3 className="text-2xl font-black text-white text-center">{copy.form.title}</h3>
          <p className="mt-2 text-center text-sm text-white/62">{copy.form.subtitle}</p>

          {sent ? (
            <FormSuccess
              successTitle={copy.form.successTitle}
              successBody={copy.form.successBody}
            />
          ) : (
            <FormFields
              isAr={isAr}
              form={form}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              showDetails={showDetails}
              setShowDetails={setShowDetails}
              submitting={submitting}
              sent={sent}
              error={error}
              interestOptions={copy.interestOptions}
              copy={copy.form}
            />
          )}
        </div>
      </div>
    </section>
  );
}
