"use client";

import { useCustomProductForm } from "./use-custom-product-form";
import { OrganizationInfoSection } from "./organization-info-section";
import { SystemCategorySection } from "./system-category-section";
import {
  ChallengesSection,
  EnvironmentSection,
  OutcomesSection,
} from "./checkbox-sections";
import { IntentSection } from "./intent-section";
import { ContactInfoSection } from "./contact-info-section";
import { FormSummary } from "./form-summary";
import { FormSuccessView } from "./form-success-view";
import { FormSubmitSection } from "./form-submit-section";

export function CustomProductForm() {
  const {
    data,
    status,
    errors,
    update,
    toggleArray,
    handleSubmit,
    handleMailtoFallback,
  } = useCustomProductForm();

  if (status === "success") {
    return <FormSuccessView contactEmail={data.contactEmail} />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl px-0 py-4 sm:py-6"
    >
      <OrganizationInfoSection data={data} errors={errors} update={update} />
      <SystemCategorySection data={data} errors={errors} update={update} />
      <ChallengesSection data={data} toggleArray={toggleArray} />
      <EnvironmentSection data={data} toggleArray={toggleArray} />
      <OutcomesSection data={data} toggleArray={toggleArray} />
      <IntentSection data={data} errors={errors} update={update} />
      <ContactInfoSection data={data} errors={errors} update={update} />
      <FormSummary data={data} />
      <FormSubmitSection
        status={status}
        onMailtoFallback={handleMailtoFallback}
      />
    </form>
  );
}
