import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { BOOKING_EMAIL } from "@/lib/marketing/booking";

export const metadata: Metadata = {
  title: "Schedule Diagnostic | AQLIYA",
  description:
    "Book a 45-minute diagnostic session or request an operational evaluation on your data.",
};

export default function EnglishContactPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Schedule a diagnostic session
          </h1>
          <p className="mt-6 text-lg text-white/60">
            One workflow, limited data scope, clear success criteria — before
            any wide commitment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ScheduleDiagnosticCta locale="en" />
            <a
              href={`mailto:${BOOKING_EMAIL}?subject=AQLIYA%20diagnostic%20session`}
              className="btn-outline h-11 px-6 text-sm font-semibold text-white"
            >
              Email us
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-sm leading-7 text-muted-foreground">
          Full intake form (Arabic UI) with evaluation fields:{" "}
          <Link href="/contact" className="text-primary underline">
            /contact
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
