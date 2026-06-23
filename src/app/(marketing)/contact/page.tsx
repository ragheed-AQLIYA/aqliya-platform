import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "../contact-form";
import {
  contactPageCopyAr,
  contactProductsAr,
  contactFormCopyAr,
} from "@/lib/marketing/copy-contact";
import { publicOsStatus } from "@/lib/marketing/public-status";

const statusKey: Record<string, keyof typeof publicOsStatus> = {
  AuditOS: "auditOS",
  LocalContentOS: "localContentOS",
  DecisionOS: "decisionOS",
  "Office AI Assistant": "officeAI",
};

export const metadata: Metadata = {
  title: contactPageCopyAr.metadata.title,
  description: contactPageCopyAr.metadata.description,
};

export default function ContactPage() {
  const c = contactPageCopyAr;

  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              {c.hero.eyebrow}
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              {c.hero.title}
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              {c.hero.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/45">
              {c.hero.bullets.map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-aqliya-cyan/60" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan">
            {c.howItWorks.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-black text-white">{c.howItWorks.title}</h2>
          <p className="mt-4 text-base leading-8 text-white/62">{c.howItWorks.body}</p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {c.howItWorks.steps.map((step) => (
              <div key={step.num} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-2xl font-bold text-white">{step.num}</p>
                <p className="mt-2 text-sm text-white/62">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan">
            {c.products.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-black text-white">{c.products.title}</h2>
          <p className="mt-4 text-base leading-8 text-white/62">{c.products.subtitle}</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {contactProductsAr.map((product) => {
            const key = statusKey[product.name];
            const status = key ? publicOsStatus[key] : null;
            return (
              <div
                key={product.name}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/20"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-white">{product.name}</h3>
                  {status && (
                    <span className="text-xs font-medium text-primary">{status.label}</span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-7 text-white/62">{product.description}</p>
                <Link
                  href={product.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-aqliya-cyan hover:text-cyan-300 transition-colors"
                >
                  {c.products.exploreLink} ←
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan text-center">
            {c.review.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-black text-white text-center">{c.review.title}</h2>
          <p className="mt-4 text-base leading-8 text-white/62 text-center mb-10">
            {c.review.subtitle}
          </p>
          <div className="space-y-4">
            {contactFormCopyAr.reviewElements.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="text-sm font-bold text-aqliya-cyan mb-1">{item.label}</p>
                <p className="text-sm leading-7 text-white/62">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400 text-center">
              {c.boundaries.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-black text-white text-center">{c.boundaries.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/62 text-center mb-8">
              {c.boundaries.subtitle}
            </p>
            <div className="space-y-3">
              {c.boundaries.items.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 shrink-0 text-amber-400/60 text-sm">⊘</span>
                  <p className="text-sm leading-7 text-white/62">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContactForm locale="ar" />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-black text-white">{c.finalCta.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">{c.finalCta.body}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/proof#evaluation-framework"
                className="btn-outline px-6 py-2.5 rounded-xl text-sm"
                data-event="click_view_pilot_proof"
              >
                ← {c.finalCta.proofLink}
              </Link>
              <a
                href="mailto:ragheed@aqliya.com"
                className="btn-primary px-6 py-2.5 rounded-xl text-sm"
                data-event="click_contact_direct"
              >
                {c.finalCta.emailLink} ←
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
