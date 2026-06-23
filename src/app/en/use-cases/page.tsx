import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Institutional Use Cases | AQLIYA",
  description:
    "Real operational paths: audit, decisions, local content, compliance, and institutional knowledge.",
};

const useCases = [
  {
    id: "audit",
    category: "AuditOS",
    title: "Internal audit and compliance",
    problem:
      "Audit teams spend 60–70% of time gathering information from scattered documents.",
    outcome:
      "Data collection cycles shrink from weeks to hours — human reviewer remains final decision owner.",
    href: "/en/products/audit",
  },
  {
    id: "decision",
    category: "DecisionOS",
    title: "Institutional decision governance",
    problem:
      "Critical decisions happen in meetings with no documented context or alternatives.",
    outcome:
      "Documented justification for any decision before board or regulator — in clicks, not hours of search.",
    href: "/en/products/decision",
  },
  {
    id: "local-content",
    category: "LocalContentOS",
    title: "Local content and regulatory compliance",
    problem:
      "Supplier data, spend, and compliance reports scattered across teams and spreadsheets.",
    outcome:
      "Compliance reports in minutes with a full evidence chain for regulatory review.",
    href: "/en/products/local-content",
  },
  {
    id: "contracting",
    category: "LocalContentOS",
    title: "Contracting and procurement compliance",
    problem:
      "Government contracts require continuous local content tracking and last-minute reporting.",
    outcome:
      "Governed supplier–spend–compliance path with alerts before deadlines.",
    href: "/en/start#contracting",
  },
];

export default function EnglishUseCasesPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Where does AQLIYA make a real difference?
          </h1>
          <p className="mt-6 text-lg text-white/60">
            Not a feature list — operational paths on one platform. Problem,
            traditional state, and governed AQLIYA path.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/en/start" className="btn-primary h-11 px-6">
              Get started
            </Link>
            <Link href="/en/products" className="btn-outline h-11 px-6">
              Operating systems
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-6 py-16">
        {useCases.map((uc) => (
          <article
            key={uc.id}
            className="rounded-2xl border border-border/60 p-6 sm:p-8"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {uc.category}
            </p>
            <h2 className="mt-1 text-xl font-black">{uc.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{uc.problem}</p>
            <p className="mt-3 text-sm font-medium">{uc.outcome}</p>
            <Link href={uc.href} className="btn-outline mt-4 inline-flex h-10 px-5 text-sm">
              Learn more
            </Link>
          </article>
        ))}

        <div className="rounded-2xl border border-border/60 p-8 text-center">
          <p className="font-black">AI assists. Humans decide. Evidence governs.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ScheduleDiagnosticCta locale="en" />
            <Link href="/en/proof" className="btn-outline h-11 px-6">
              Proof center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
