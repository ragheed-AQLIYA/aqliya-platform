import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import {
  roadmapProductCardsEn,
} from "@/lib/marketing/product-pages-content-en";

export const metadata: Metadata = {
  title: "Operating Systems | AQLIYA",
  description:
    "Governed operating systems on AQLIYA Intelligence Core — AuditOS, LocalContentOS, and DecisionOS.",
};

const tier1ProductCardsEn = [
  {
    id: "audit",
    title: "AuditOS",
    subtitle: "Audit and financial intelligence",
    statusLabel: "Available to deploy",
    problem: "From trial balance to sign-off-ready file — a complete evidence path.",
    href: "/en/products/audit",
  },
  {
    id: "local-content",
    title: "LocalContentOS",
    subtitle: "Local content and compliance",
    statusLabel: "Available by agreed scope",
    problem: "Suppliers, spend, and regulatory reports — no more fragmented spreadsheets.",
    href: "/en/products/local-content",
  },
  {
    id: "decision",
    title: "DecisionOS",
    subtitle: "Decision governance",
    statusLabel: "Integrated into platform",
    problem: "Alternatives, criteria, risk, and approval — no scattered memos.",
    href: "/en/products/decision",
  },
];

function ProductCard({
  card,
}: {
  card: (typeof tier1ProductCardsEn)[number];
}) {
  return (
    <Link
      href={card.href}
      className={cn(
        "group flex flex-col rounded-2xl border p-6 transition-colors hover:border-primary/30",
        "muted" in card && card.muted
          ? "border-border/50 bg-muted/20 opacity-80"
          : "border-border/70 bg-background",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-foreground group-hover:text-primary">
            {card.title}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{card.subtitle}</p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
            "muted" in card && card.muted
              ? "border-amber-500/25 text-amber-700"
              : "border-emerald-500/25 text-emerald-700",
          )}
        >
          {card.statusLabel}
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">{card.problem}</p>
      <span className="mt-5 text-sm font-semibold text-primary">Explore →</span>
    </Link>
  );
}

export default function EnglishProductsPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Operating systems on one core
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/60">
            Audit, local content, and decisions — shared governance, evidence
            chains, and human approval gates.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Core operating systems
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {tier1ProductCardsEn.map((card) => (
            <ProductCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700/80">
            Platform roadmap & shared services
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Shared capabilities and early-stage systems — discussed within your activation scope.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {roadmapProductCardsEn.map((card) => (
              <ProductCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Every system runs on Evidence Chain · RBAC · Audit Trail · Human Approval
            </p>
            <div className="flex gap-3">
              <Link href="/en/governance" className="btn-outline h-9 px-4 text-xs">
                Governance
              </Link>
              <Link href="/en/platform" className="btn-outline h-9 px-4 text-xs">
                Intelligence Core
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ConversionBand
        secondaryHref="/en/start"
        secondaryLabel="Where to start"
      />
    </div>
  );
}
