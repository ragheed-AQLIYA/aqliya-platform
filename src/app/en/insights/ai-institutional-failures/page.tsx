import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Five Institutional AI Failures  And What They Share | AQLIYA",
  description:
    "These institutions didn't fail because the AI was poor. They failed because there was no governance structure in place. The common thread across five cases from different sectors.",
};

export default function Article1() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-3xl text-center">
            <Link
              href="/en/insights"
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white/60"
            >
              ← Insights & Articles
            </Link>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400">
                Analysis
              </span>
              <span className="text-[10px] text-white/30">May 2025</span>
              <span className="text-[10px] text-white/30">8 min read</span>
            </div>
            <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl">
              Five Institutional AI Failures  And What They Share
            </h1>
          </div>
        </div>
      </section>

      {/* Article */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="prose prose-invert prose-lg max-w-none">

            <p className="lead text-lg text-white/75 leading-8">
              At every AI conference, you hear the success stories. High-accuracy models, time savings, impressive automation. But the private conversations  with technical, legal, and compliance teams  tell a very different story.
            </p>

            <p className="text-white/65 leading-8">
              The common thread across the five cases we&apos;ll examine isn&apos;t the model type or data quality. It&apos;s the absence of a clear governance structure around AI  who approves, what gets logged, and what happens when things go wrong.
            </p>

            <h2 className="mt-10 text-2xl font-black text-white">
              1. Financial Company: Credit Recommendation Without an Audit Trail
            </h2>
            <p className="text-white/65 leading-8">
              A mid-sized finance company used a model to classify credit applications. The model was accurate by test metrics. The problem emerged when a customer challenged a rejection  no one could provide a documented rationale. The model &ldquo;decided,&rdquo; but no one knew why. The regulatory fine exceeded the cost of building a proper documentation system from scratch.
            </p>
            <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">Lesson</p>
              <p className="mt-1 text-sm text-white/60">
                Any decision with a direct impact on an external party needs a justification record that withstands review. The model doesn&apos;t provide this by nature  governance does.
              </p>
            </div>

            <h2 className="mt-10 text-2xl font-black text-white">
              2. Government Entity: Automated Report Distributed Without Review
            </h2>
            <p className="text-white/65 leading-8">
              A government agency adopted an automated reporting system. In one cycle, the report contained an error in data classification due to a source format change. The report was distributed externally before the error was discovered. Correcting the mistake cost months of trust and effort.
            </p>
            <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">Lesson</p>
              <p className="mt-1 text-sm text-white/60">
                Automation without a human review gate before external distribution is an institutional risk. Production speed doesn&apos;t justify the absence of verification.
              </p>
            </div>

            <h2 className="mt-10 text-2xl font-black text-white">
              3. Real Estate Company: A &ldquo;Smart&rdquo; Knowledge Base That Produced Expired Legal Advice
            </h2>
            <p className="text-white/65 leading-8">
              A company built an intelligent search system over legal and regulatory documents. The system was effective  until regulations changed and the knowledge base wasn&apos;t updated. For months, the system confidently answered team questions based on superseded legislation. There was no mechanism to track document &ldquo;validity.&rdquo;
            </p>
            <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">Lesson</p>
              <p className="mt-1 text-sm text-white/60">
                Linking outputs to source documents with expiry dates isn&apos;t a bonus feature  it&apos;s a requirement for any knowledge system in regulated environments.
              </p>
            </div>

            <h2 className="mt-10 text-2xl font-black text-white">
              4. Hospital: Alert System Silenced Due to &ldquo;Noise&rdquo;
            </h2>
            <p className="text-white/65 leading-8">
              An anomaly detection system produced many false positives early on. The medical team gradually began ignoring alerts. When the system produced a real alert months later, it didn&apos;t receive the required response in time. The problem wasn&apos;t the model  it was the absence of a clear protocol for handling alerts.
            </p>
            <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">Lesson</p>
              <p className="mt-1 text-sm text-white/60">
                Model quality and operational design are two entirely different matters. The system needs a response protocol, not just outputs.
              </p>
            </div>

            <h2 className="mt-10 text-2xl font-black text-white">
              5. Logistics Company: Automated Procurement Decisions Without a Cap
            </h2>
            <p className="text-white/65 leading-8">
              A procurement automation system issued purchase orders automatically based on inventory signals. During a market fluctuation, the system issued unexpectedly large orders  correct within its internal logic, but outside any human approval framework. The resulting financial commitments took a full quarter to resolve.
            </p>
            <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">Lesson</p>
              <p className="mt-1 text-sm text-white/60">
                Every decision with a financial or operational impact threshold must pass through an approval gate. &ldquo;Logically correct&rdquo; doesn&apos;t mean &ldquo;institutionally correct.&rdquo;
              </p>
            </div>

            <h2 className="mt-12 text-2xl font-black text-white">
              The Common Thread
            </h2>
            <p className="text-white/65 leading-8">
              In each of the five cases, the AI was working. The problem was the absence of a clear answer to one question: What happens when it makes a mistake?
            </p>
            <p className="text-white/65 leading-8">
              Governance doesn&apos;t mean crippling AI or stripping its efficiency. It means building a clear framework around when it acts, when it&apos;s reviewed, and how it&apos;s documented  so that when errors occur, they are contained, addressable, and learnable.
            </p>
            <p className="text-white/65 leading-8">
              AI without governance isn&apos;t just dangerous. It&apos;s institutionally unsustainable.
            </p>
          </div>

          {/* Divider */}
          <div className="mt-16 border-t border-white/8 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Related Articles
                </p>
                <Link
                  href="/en/insights/governance-over-intelligence"
                  className="mt-2 block text-sm font-semibold text-white/70 transition-colors hover:text-aqliya-cyan"
                >
                  Why Governance Matters More Than Intelligence →
                </Link>
              </div>
              <Link href="/en/proof#executive-brief" className="btn-primary px-6">
                Request Executive Briefing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
