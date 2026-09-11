"use client";

type SidebarCopy = {
  eyebrow: string;
  title: string;
  body: string;
  hints: readonly string[];
  directEmailTitle: string;
};

type Props = {
  copy: SidebarCopy;
};

export function Sidebar({ copy }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan">
        {copy.eyebrow}
      </p>
      <h2 className="text-3xl font-black text-white">{copy.title}</h2>
      <p className="text-base leading-8 text-white/62">{copy.body}</p>
      <div className="space-y-3">
        {copy.hints.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan" />
            <p className="text-sm leading-7 text-white/62">{item}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[24px] border border-aqliya-cyan/10 bg-gradient-to-br from-aqliya-cyan/[0.06] via-transparent to-aqliya-cyan/[0.04] p-6">
        <p className="text-sm font-bold text-white">{copy.directEmailTitle}</p>
        <a
          href="mailto:ragheed@aqliya.com"
          className="mt-3 block text-lg font-semibold text-aqliya-cyan hover:text-cyan-300 transition-colors"
        >
          ragheed@aqliya.com
        </a>
      </div>
    </div>
  );
}
