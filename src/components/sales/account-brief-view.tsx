"use client";

import type { AccountBriefPack } from "@/lib/sales/account-brief-pack";
import { useAccountBriefView } from "./components/use-account-brief-view";
import { AccountBriefHeader } from "./components/account-brief-header";
import { AccountBriefInfoCard } from "./components/account-brief-info-card";
import { AccountBriefIcpCard } from "./components/account-brief-icp-card";
import { AccountBriefSignalsCard } from "./components/account-brief-signals-card";
import { AccountBriefResearchCard } from "./components/account-brief-research-card";
import { AccountBriefDealsCard } from "./components/account-brief-deals-card";
import { AccountBriefEvidenceCard } from "./components/account-brief-evidence-card";

export function AccountBriefView({ pack }: { pack: AccountBriefPack }) {
  const { icp, research } = useAccountBriefView(pack);

  return (
    <div className="space-y-6 print:space-y-4">
      <AccountBriefHeader accountId={pack.accountId} />
      <AccountBriefInfoCard pack={pack} />
      <AccountBriefIcpCard assessment={pack.icpAssessment} />
      <AccountBriefSignalsCard signals={pack.signals} />
      <AccountBriefResearchCard research={research} />
      <AccountBriefDealsCard deals={pack.deals} />
      <AccountBriefEvidenceCard
        evidenceCount={pack.evidenceCount}
        evidenceLinks={pack.evidenceLinks}
      />
    </div>
  );
}
