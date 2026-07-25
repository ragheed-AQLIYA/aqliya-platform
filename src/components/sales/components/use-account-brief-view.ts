import type { AccountBriefPack } from "@/lib/sales/account-brief-pack";

export function useAccountBriefView(pack: AccountBriefPack) {
  const icp = pack.icpAssessment.score;
  const research = pack.research;

  return {
    pack,
    icp,
    research,
  };
}
