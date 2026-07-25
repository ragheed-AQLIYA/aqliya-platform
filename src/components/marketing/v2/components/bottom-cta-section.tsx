"use client";

import Link from "next/link";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";

type BottomCtaSectionProps = {
  proofHref: string;
  useCasesHref: string;
  contactHref: string;
  proofLabel: string;
  useCasesLabel: string;
  locale: "ar" | "en";
};

export function BottomCtaSection({
  proofHref,
  useCasesHref,
  contactHref,
  proofLabel,
  useCasesLabel,
  locale,
}: BottomCtaSectionProps) {
  return (
    <>
      <section className="border-t py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-4 px-6">
          <Link href={proofHref} className="btn-outline h-11 px-6">
            {proofLabel}
          </Link>
          <Link href={useCasesHref} className="btn-outline h-11 px-6">
            {useCasesLabel}
          </Link>
        </div>
      </section>
      <ConversionBand
        title={locale === "en" ? "We start by understanding your context" : undefined}
        body={locale === "en" ? "Free intro call — we explain the platform and suggest a sensible next step." : undefined}
        primaryHref={contactHref}
        primaryLabel={locale === "en" ? "Book a Diagnostic Session" : undefined}
        secondaryHref={proofHref}
        secondaryLabel={proofLabel}
      />
    </>
  );
}
