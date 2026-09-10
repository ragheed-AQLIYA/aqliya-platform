"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type FAQNamespace = "faq.home" | "faq.pricing";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items?: FAQItem[];
  faqNamespace?: FAQNamespace;
  heading?: string;
  headingAr?: string;
  eyebrow?: string;
  eyebrowAr?: string;
}

function FAQPageJsonLd({ items }: { items: FAQItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQSection({
  items: externalItems,
  faqNamespace = "faq.home",
  heading,
  headingAr,
  eyebrow,
  eyebrowAr,
}: FAQSectionProps) {
  const t = useTranslations(faqNamespace);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  const title = headingAr || heading || t("title");
  const subtitle = eyebrowAr || eyebrow || t("eyebrow");

  const resolvedItems: FAQItem[] = externalItems ?? (() => {
    const count = Number(t("count"));
    return Array.from({ length: count }, (_, i) => ({
      question: t(`q${i + 1}`),
      answer: t(`a${i + 1}`),
    }));
  })();

  return (
    <>
      <FAQPageJsonLd items={resolvedItems} />
      <section className="border-t bg-muted/10">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {subtitle}
            </p>
            <h2 className="mt-4 text-3xl font-black text-foreground">
              {title}
            </h2>
          </div>

          <div className="mt-12 space-y-3" role="list">
            {resolvedItems.map((item, index) => {
              const isOpen = openIndex === index;
              const questionText = item.question;
              const answerText = item.answer;

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border/60 bg-background transition-colors"
                  role="listitem"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-right"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <h3 className="text-base font-bold text-foreground">
                      {questionText}
                    </h3>
                    <span
                      className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    hidden={!isOpen}
                  >
                    <div className="px-5 pb-5">
                      <p className="text-sm leading-7 text-muted-foreground">
                        {answerText}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
