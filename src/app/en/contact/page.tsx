import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { BOOKING_EMAIL } from "@/lib/marketing/booking";
import { contactPageCopyEn } from "@/lib/marketing/copy-contact-en";

export const metadata: Metadata = {
  title: contactPageCopyEn.metadata.title,
  description: contactPageCopyEn.metadata.description,
};

export default function EnglishContactPage() {
  const c = contactPageCopyEn;

  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
            {c.hero.eyebrow}
          </span>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">{c.hero.title}</h1>
          <p className="mt-6 text-lg text-white/60">{c.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ScheduleDiagnosticCta locale="en" />
            <a
              href={`mailto:${BOOKING_EMAIL}?subject=AQLIYA%20intro%20call`}
              className="btn-outline h-11 px-6 text-sm font-semibold text-white"
            >
              Email us
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-sm leading-7 text-muted-foreground">
          Full intake form:{" "}
          <Link href="/contact" className="text-primary underline">
            /contact
          </Link>
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {c.finalCta.proofLink}:{" "}
          <Link href="/en/proof#evaluation-framework" className="text-primary underline">
            /en/proof
          </Link>
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Procurement pack:{" "}
          <Link href="/en/procurement-pack" className="text-primary underline">
            evaluation documents
          </Link>
        </p>
      </section>
    </div>
  );
}
