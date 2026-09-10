import { cn } from "@/lib/utils";

export type ArchLayer = {
  num: string;
  title: string;
  desc: string;
};

type PlatformArchitectureProps = {
  topLabel: string;
  topDesc: string;
  layers: ArchLayer[];
  bottomLabel: string;
  bottomDesc: string;
  /** Visual node accent (deep → cyan) intensity per layer. */
  className?: string;
};

/**
 * Conceptual AQLIYA intelligence stack.
 *
 * A vertical, RTL/LTR-neutral diagram: institution inputs flow UP through
 * governance → knowledge → intelligence → operating systems into institutional
 * outcomes. Pure CSS/SVG, no client JS, no fake dashboards.
 */
export function PlatformArchitecture({
  topLabel,
  topDesc,
  layers,
  bottomLabel,
  bottomDesc,
  className,
}: PlatformArchitectureProps) {
  return (
    <div className={cn("mx-auto max-w-2xl", className)} aria-hidden="false">
      {/* Outcomes (top of the flow) */}
      <ArchEndcap label={bottomLabel} desc={bottomDesc} tone="outcome" />

      <ArchConnector />

      {/* Stacked layers, rendered top→bottom but flowing upward */}
      <div className="space-y-2.5">
        {layers.map((layer) => (
          <div
            key={layer.num}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition-colors hover:border-aqliya-cyan/30 sm:p-5"
          >
            <span
              className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-aqliya-blue to-aqliya-cyan"
              aria-hidden
            />
            <div className="flex items-start gap-4 ps-2">
              <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-aqliya-cyan tabular-nums">
                {layer.num}
              </span>
              <div>
                <h3 className="text-sm font-bold text-white sm:text-base">{layer.title}</h3>
                <p className="mt-1 text-xs leading-6 text-white/55 sm:text-[13px]">{layer.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ArchConnector />

      {/* Institution inputs (base of the flow) */}
      <ArchEndcap label={topLabel} desc={topDesc} tone="input" />
    </div>
  );
}

function ArchEndcap({
  label,
  desc,
  tone,
}: {
  label: string;
  desc: string;
  tone: "input" | "outcome";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-center backdrop-blur-sm sm:p-5",
        tone === "outcome"
          ? "border-aqliya-cyan/25 bg-aqliya-cyan/[0.06]"
          : "border-white/12 bg-white/[0.03]",
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-[0.22em]",
          tone === "outcome" ? "text-aqliya-cyan" : "text-white/45",
        )}
      >
        {label}
      </p>
      <p className="mt-1.5 text-xs leading-6 text-white/60 sm:text-[13px]">{desc}</p>
    </div>
  );
}

function ArchConnector() {
  return (
    <div className="flex justify-center py-2" aria-hidden>
      <svg width="14" height="26" viewBox="0 0 14 26" fill="none" className="text-aqliya-cyan/40">
        <path d="M7 26V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M2.5 8.5L7 4l4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
