import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { publicOsStatusEn } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "LocalContentOS — Local Content & Compliance | AQLIYA",
  description:
    "Governed operating system for local content, suppliers, spend, contracts, evidence, and regulatory reports — built for the Saudi market.",
};

const journey = [
  {
    step: "01",
    title: "Suppliers & classification",
    detail: "Vendor registry with governed classification workflow.",
  },
  {
    step: "02",
    title: "Spend & contracts",
    detail: "Spend linked to suppliers and contract evidence in one path.",
  },
  {
    step: "03",
    title: "Compliance gaps",
    detail: "Gap analysis and indicators — not late spreadsheet reports.",
  },
  {
    step: "04",
    title: "Local content scoring",
    detail: "Score model with traceable inputs and human review gates.",
  },
  {
    step: "05",
    title: "Regulatory reports",
    detail: "Exportable reports with evidence chain and approval status.",
  },
];

const outputs = [
  "Supplier classification",
  "Spend analysis",
  "Local content indicators",
  "Compliance gap view",
  "Procurement impact simulation",
  "Local content report",
  "Supplier improvement tracker",
];

export default function EnglishLocalContentProductPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Link
            href="/en/platform#capabilities"
            className="text-sm text-white/45 hover:text-white/70"
          >
            ← Operating systems
          </Link>
          <div className="mt-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-aqliya-cyan">
              {publicOsStatusEn.localContentOS.label}
            </span>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
              LocalContentOS
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/65">
              {publicOsStatusEn.localContentOS.capabilityNote}. Local content
              measurement should be an operational path — not a delayed report
              from scattered spreadsheets.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ScheduleDiagnosticCta locale="en" />
              <Link href="/en/industries#compliance" className="btn-outline px-6 py-3">
                Compliance sector
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-black text-foreground">Workflow journey</h2>
        <div className="mt-8 space-y-4">
          {journey.map((j) => (
            <div
              key={j.step}
              className="flex gap-4 rounded-xl border border-border/60 p-5"
            >
              <span className="text-sm font-black text-primary">{j.step}</span>
              <div>
                <h3 className="font-bold text-foreground">{j.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{j.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl border-t px-6 py-16">
        <h2 className="text-2xl font-black text-foreground">Outputs</h2>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {outputs.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Built for Saudi local content programs on AQLIYA Intelligence Core.
        </p>
      </section>
    </div>
  );
}
