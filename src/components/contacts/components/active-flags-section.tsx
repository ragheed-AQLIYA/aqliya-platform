"use client";

import type { RiskFlag } from "@/actions/contact-actions";
import { ActiveFlagCard } from "./active-flag-card";

interface ActiveFlagsSectionProps {
  flags: RiskFlag[];
  loading: string | null;
  onResolve: (flagId: string) => void;
}

export function ActiveFlagsSection({ flags, loading, onResolve }: ActiveFlagsSectionProps) {
  if (flags.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">نشطة</p>
      {flags.map((flag) => (
        <ActiveFlagCard
          key={flag.id}
          flag={flag}
          loading={loading}
          onResolve={onResolve}
        />
      ))}
    </div>
  );
}
