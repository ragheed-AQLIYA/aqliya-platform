import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Smart Assistant vs Governed Institutional Intelligence | AQLIYA",
  description:
    "The difference between a smart assistant and governed institutional intelligence isn't model size  it's the structure of accountability and evidence.",
};

export default function Article2() {
  return (
    <div className="flex flex-col">
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
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                Concept
              </span>
              <span className="text-[10px] text-white/30">May 2025</span>
              <span className="text-[10px] text-white/30">6 min read</span>
            </div>
            <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl">
              Smart Assistant vs Governed Institutional Intelligence  A Fundamental, Not Technical, Difference
            </h1>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="prose prose-invert prose-lg max-w-none">

            <p className="lead text-lg text-white/75 leading-8">
              &ldquo;We use AI across all our departments.&rdquo; This sentence describes two radically different things  and many institutions don&apos;t know the difference until it costs them.
            </p>

            <h2 className="mt-10 text-2xl font-black text-white">
              The Smart Assistant: A Productivity Tool
            </h2>
            <p className="text-white/65 leading-8">
              A smart assistant  whether a language model in a chat interface, a summarization tool, or a content generator  is a tool that enhances individual productivity. It answers questions, summarizes documents, drafts text.
            </p>
            <p className="text-white/65 leading-8">
              There is no record of who used it for what purpose. No link between its outputs and specific sources. No protocol for when to act on its outputs and when to review. It&apos;s a personal tool in the employee&apos;s hands  not an institutional system.
            </p>

            <h2 className="mt-10 text-2xl font-black text-white">
              Governed Institutional Intelligence: An Operational Architecture
            </h2>
            <p className="text-white/65 leading-8">
              Governed institutional intelligence is not a bigger tool or a smarter model. It&apos;s a complete operational architecture surrounding AI usage with a clear structure:
            </p>
            <ul className="space-y-2 text-white/65">
              <li>Every output linked to its original, verifiable sources</li>
              <li>Every action tied to a user and timestamped</li>
              <li>Every consequential decision passes through documented human approval</li>
              <li>Every access governed by role-based permissions</li>
              <li>The full record is immutable</li>
            </ul>

            <div className="my-8 overflow-hidden rounded-2xl border border-white/8">
              <div className="grid lg:grid-cols-2">
                <div className="border-b border-white/8 p-6 lg:border-b-0 lg:border-e border-white/8">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    Smart Assistant
                  </p>
                  <ul className="space-y-2.5 text-sm text-white/55">
                    {[
                      "Usage is individual and undocumented",
                      "Outputs are not linked to specific sources",
                      "No record of who used what",
                      "Decision relies solely on the user",
                      "No framework for when to act on outputs",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">
                    Governed Intelligence
                  </p>
                  <ul className="space-y-2.5 text-sm text-white/65">
                    {[
                      "Every usage logged with identity and time",
                      "Every output linked to its original sources",
                      "Full immutable audit trail",
                      "Decisions require explicit human approval",
                      "Clear protocol for each output type",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-aqliya-cyan/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="mt-10 text-2xl font-black text-white">
              Why Does the Difference Matter?
            </h2>
            <p className="text-white/65 leading-8">
              When a compliance officer asks: &ldquo;Can you prove this report is accurate?&rdquo;  the smart assistant doesn&apos;t help. Governed intelligence responds with a complete evidence chain.
            </p>
            <p className="text-white/65 leading-8">
              When a regulator asks: &ldquo;Who approved this decision, when, and on what basis?&rdquo;  the smart assistant has no answer. Governed intelligence produces the report in minutes.
            </p>
            <p className="text-white/65 leading-8">
              The difference isn&apos;t technical. It&apos;s institutional. And it&apos;s the difference between a tool and an architecture.
            </p>

          </div>

          <div className="mt-16 border-t border-white/8 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Related Article
                </p>
                <Link
                  href="/en/insights/governance-over-intelligence"
                  className="mt-2 block text-sm font-semibold text-white/70 transition-colors hover:text-aqliya-cyan"
                >
                  Why Governance Matters More Than Intelligence →
                </Link>
              </div>
              <Link href="/en/platform" className="btn-primary px-6">
                AQLIYA Intelligence Core
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
