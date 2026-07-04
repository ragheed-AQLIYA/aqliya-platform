import type { Metadata } from "next";
import Link from "next/link";
import { institutionalUseCasesEn } from "@/lib/marketing/institutional-use-cases-en";

export const metadata: Metadata = {
  title: "Insights & Articles | AQLIYA",
  description:
    "Analysis and articles about governed institutional intelligence  from the perspective of governance, accountability, and real operational impact.",
};

const articles = [
  {
    slug: "ai-institutional-failures",
    category: "Analysis",
    categoryColor: "text-red-400",
    title: "Five Cases of Institutional AI Failure  And What They Share in Common",
    excerpt:
      "These institutions did not fail because the AI was poor. They failed because there was no governance structure surrounding its use. The shared story across five cases from different sectors.",
    readTime: "8 min read",
    date: "May 2025",
  },
  {
    slug: "assistant-vs-governed-intelligence",
    category: "Concept",
    categoryColor: "text-violet-400",
    title: "Smart Assistant vs. Governed Institutional Intelligence  A Fundamental, Not Technical, Difference",
    excerpt:
      "Most institutions think they are building institutional intelligence while actually running a smart assistant. The difference is not model size or output accuracy  it is the structure of accountability and evidence.",
    readTime: "6 min read",
    date: "May 2025",
  },
  {
    slug: "governance-over-intelligence",
    category: "Perspective",
    categoryColor: "text-emerald-400",
    title: "Why Governance Matters More Than Intelligence  The Equation Most AI Teams Overlook",
    excerpt:
      "The question is not 'How accurate is our model?' but 'Can we answer this question: who approved this action and why?' Intelligence without governance is a liability, not an asset.",
    readTime: "7 min read",
    date: "May 2025",
  },
];

export default function InsightsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              Insights & Articles
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              Analysis Without Marketing
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62">
              Articles that examine institutional AI from the angle of governance,
              accountability, and real impact  not from a promotional perspective.
            </p>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="space-y-6">
            {articles.map((article, i) => (
              <Link key={article.slug} href={`/en/insights/${article.slug}`}>
                <div className="group glass-card-light rounded-2xl p-8 transition-all hover:border-white/15">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${article.categoryColor}`}>
                      {article.category}
                    </span>
                    <span className="text-[10px] text-white/30">{article.date}</span>
                    <span className="text-[10px] text-white/30">{article.readTime}</span>
                    {i === 0 && (
                      <span className="rounded-full border border-aqliya-cyan/30 bg-aqliya-cyan/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-aqliya-cyan">
                        New
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-white transition-colors group-hover:text-aqliya-cyan sm:text-2xl">
                    {article.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/55">{article.excerpt}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-aqliya-cyan/70 transition-colors group-hover:text-aqliya-cyan">
                    Read Article
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Editorial note */}
          <div className="mt-12 rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center">
            <p className="text-sm font-semibold text-white/60">
              Editorial Note
            </p>
            <p className="mt-2 text-sm leading-7 text-white/40">
              AQLIYA articles are written from a practice perspective  not from a marketing perspective.
              If you find a claim that does not hold up to scrutiny, we welcome direct contact.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section-gradient-dark border-t border-white/5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              Use Cases
            </p>
            <h2 className="mt-4 text-3xl font-black text-white">
              Where Does AQLIYA Intelligence Make a Real Difference?
            </h2>
            <p className="mt-4 text-base leading-8 text-white/58">
              Seven categories of real institutional challenges  the problem as it is, the
              traditional state honestly, and AQLIYA&apos;s path with a clear caveat: humans always decide.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-6xl space-y-6">
            {institutionalUseCasesEn.map((uc) => (
              <div
                key={uc.id}
                className={`rounded-[24px] border ${uc.categoryBorder} ${uc.categoryBg} p-6 sm:p-8`}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${uc.categoryColor}`}>
                      {uc.category}
                    </span>
                    <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">
                      {uc.title}
                    </h3>
                  </div>
                  <span className="text-2xl text-white/10">{uc.icon}</span>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4">
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-red-400">The Problem</p>
                    <p className="text-sm leading-7 text-white/65">{uc.problem}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">Traditional State</p>
                    <p className="text-sm leading-7 text-white/55">{uc.traditionalState}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-400">AQLIYA Approach</p>
                    <p className="text-sm leading-7 text-white/65">{uc.aqliyaApproach}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">Institutional Impact</p>
                    <p className="mt-1 text-sm text-white/70">{uc.outcome}</p>
                  </div>
                  <Link
                    href={uc.systemLink}
                    className="btn-outline shrink-0 px-4 py-2 text-sm"
                  >
                    {uc.systemLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-white/8 bg-white/[0.025] p-6 text-center">
            <p className="text-sm font-semibold text-white/60">
              Fixed Institutional Caveat Across All Use Cases
            </p>
            <p className="mt-2 text-base font-black text-white">
              AI assists. Humans decide. Evidence governs.
            </p>
            <p className="mt-2 text-sm text-white/45">
              AQLIYA does not make final decisions. Every institutionally impactful action requires explicit
              human approval  this is an engineering constraint, not a configurable option.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}