import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { BOOKING_EMAIL } from "@/lib/marketing/booking";
import { procurementPackItemsEn } from "@/lib/marketing/procurement-pack-items";

export const metadata: Metadata = {
  title: "Procurement Evaluation Pack | AQLIYA",
  description:
    "Ready documents for procurement and security: executive brief, security summary, DPA, data residency, evaluation SOW, and proof center.",
};

export default function EnglishProcurementPackPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
            Procurement Evaluation Pack
          </p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
            Evaluation pack for buyers
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/60">
            Everything procurement, security, and IT need to evaluate AQLIYA —
            with honest readiness and boundary statements.
          </p>
          <p className="mt-4 text-sm text-white/45">
            Commercial contact:{" "}
            <a href={`mailto:${BOOKING_EMAIL}`} className="text-aqliya-cyan underline">
              {BOOKING_EMAIL}
            </a>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {procurementPackItemsEn.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border/60 bg-background p-6"
            >
              <h2 className="text-base font-black text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="btn-outline mt-4 inline-flex h-10 items-center px-5 text-sm"
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-black text-foreground">
            Need a technical session or diagnostic?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We arrange an engineering session or executive diagnostic based on
            your context.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <ScheduleDiagnosticCta locale="en" />
            <Link href="/en/contact" className="btn-outline h-11 px-6">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
