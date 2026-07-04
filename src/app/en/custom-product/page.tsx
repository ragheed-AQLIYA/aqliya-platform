import type { Metadata } from "next";
import { CustomProductForm } from "@/components/forms/custom-product-form";
import { SectionEyebrow } from "@/components/enterprise";

const fitCases = [
  "When workflows are scattered across multiple teams with no single governed path.",
  "When an off-the-shelf product isn't enough and your institution needs its own operational logic.",
  "When data, outputs, review, and approval must remain inside one controlled environment.",
];

const formSteps = [
  "Organization",
  "System",
  "Challenges",
  "Environment",
  "Outputs",
  "Goal",
  "Contact",
];

export const metadata: Metadata = {
  title: "Design Your System on AQLIYA | AQLIYA",
  description:
    "Design a custom governed system tailored to your institution's workflows. Submit your request and our team will reach out.",
};

export default function EnCustomProductPage() {
  return (
    <div className="flex flex-col gap-16 sm:gap-20" dir="ltr">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="relative mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              Custom Institutional System
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              When an off-the-shelf system won&apos;t cut it, build yours on the
              same AQLIYA core
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/62 sm:text-lg">
              This page is for institutions that don&apos;t just need another
              tool — they need a governed operational path built around their
              actual reality: data, roles, permissions, review, and outputs.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan">
                When is this a fit?
              </p>
              <div className="mt-4 space-y-3">
                {fitCases.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-white/78"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan" />
                    <p className="text-sm leading-7">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan">
                Request flow
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-white/60">
                {formSteps.map((step, index) => (
                  <div key={step} className="contents">
                    <span
                      className={
                        index === 0
                          ? "rounded-full bg-white/12 px-3 py-1 text-white"
                          : "rounded-full bg-white/6 px-3 py-1"
                      }
                    >
                      {step}
                    </span>
                    {index < formSteps.length - 1 && (
                      <span className="text-white/25">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            <SectionEyebrow
              label="Before you submit"
              title="What do we need to understand before designing any system?"
              description="We need to understand the domain, decision patterns, data nature, permission boundaries, and whether the need is a clear system line or a cross-team composite path."
              align="left"
              className="max-w-none"
            />
            <div className="rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm">
              <p className="text-sm font-bold text-foreground">
                What happens after submission?
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>1. We review the request to understand the operational gap.</p>
                <p>
                  2. We determine whether the need is closer to a ready system
                  line or a custom design.
                </p>
                <p>
                  3. We follow up with a clear starting point — not a generic
                  reply.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-border/70 bg-gradient-to-br from-background via-background to-muted/30 p-4 shadow-sm sm:p-6">
            <CustomProductForm />
          </div>
        </div>
      </section>
    </div>
  );
}
