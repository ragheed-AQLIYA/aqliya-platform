import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignEngagementPresentationPolicyAction,
  createOrgPresentationPolicyAction,
  updateOrgPresentationPolicyAction,
} from "@/actions/audit-presentation-policy-actions";
import type { PresentationPolicySummary } from "@/lib/audit/presentation/presentation-policy-service";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
import type { PresentationProfileRebuildResult } from "@/lib/audit/presentation/presentation-profile-rebuild-types";

function parseGlList(value: string): string[] {
  return value
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

interface UsePresentationPolicySettingsProps {
  engagementId: string;
  policies: PresentationPolicySummary[];
  currentPolicyId: string | null;
  currentPolicy: PresentationPolicyRules;
}

export function usePresentationPolicySettings({
  engagementId,
  policies,
  currentPolicyId,
  currentPolicy,
}: UsePresentationPolicySettingsProps) {
  const router = useRouter();
  const resolvedId =
    currentPolicyId ??
    policies.find((p) => p.slug === currentPolicy.slug)?.id ??
    "";

  const [policyId, setPolicyId] = useState(resolvedId);
  const [fsRebuild, setFsRebuild] =
    useState<PresentationProfileRebuildResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [cloneName, setCloneName] = useState("");
  const [clonePending, startCloneTransition] = useTransition();

  const selected = useMemo(
    () => policies.find((p) => p.id === policyId) ?? null,
    [policies, policyId],
  );

  const canEdit = selected != null && !selected.isSystem;

  const [editRevenueExcl, setEditRevenueExcl] = useState(
    currentPolicy.revenue.operatingExclusionGlCodes.join(", "),
  );
  const [editCorExcl, setEditCorExcl] = useState(
    currentPolicy.costOfRevenue.exclusionGlCodes.join(", "),
  );
  const [editCorPrefix, setEditCorPrefix] = useState(
    currentPolicy.costOfRevenue.exclusionPrefixPatterns.join(", "),
  );
  const [editOtherNet, setEditOtherNet] = useState(
    currentPolicy.otherIncome.targetNet?.toString() ?? "",
  );
  const [editFinanceOffset, setEditFinanceOffset] = useState(
    currentPolicy.finance.netOffset?.toString() ?? "",
  );

  const dirtyAssign = policyId !== resolvedId;

  const handleAssign = () => {
    setError(null);
    setFsRebuild(null);
    startTransition(async () => {
      try {
        const result = await assignEngagementPresentationPolicyAction({
          engagementId,
          policyId,
        });
        setFsRebuild(result.fsRebuild);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to assign policy");
      }
    });
  };

  const handleClone = () => {
    if (!cloneName.trim()) return;
    setError(null);
    startCloneTransition(async () => {
      try {
        const created = await createOrgPresentationPolicyAction({
          templateSlug: currentPolicy.slug,
          name: cloneName.trim(),
        });
        setPolicyId(created.id);
        setCloneName("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create policy");
      }
    });
  };

  const handleSaveEdits = () => {
    if (!selected || selected.isSystem) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateOrgPresentationPolicyAction({
          policyId: selected.id,
          fields: {
            revenueOperatingExclusionGlCodes: parseGlList(editRevenueExcl),
            costOfRevenueExclusionGlCodes: parseGlList(editCorExcl),
            costOfRevenueExclusionPrefixPatterns: parseGlList(editCorPrefix),
            otherIncomeTargetNet: editOtherNet
              ? Number(editOtherNet.replace(/,/g, ""))
              : null,
            financeNetOffset: editFinanceOffset
              ? Number(editFinanceOffset.replace(/,/g, ""))
              : null,
          },
        });
        const assignResult = await assignEngagementPresentationPolicyAction({
          engagementId,
          policyId: selected.id,
        });
        setFsRebuild(assignResult.fsRebuild);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update policy");
      }
    });
  };

  return {
    policyId,
    setPolicyId,
    fsRebuild,
    error,
    pending,
    cloneName,
    setCloneName,
    clonePending,
    selected,
    canEdit,
    dirtyAssign,
    editRevenueExcl,
    setEditRevenueExcl,
    editCorExcl,
    setEditCorExcl,
    editCorPrefix,
    setEditCorPrefix,
    editOtherNet,
    setEditOtherNet,
    editFinanceOffset,
    setEditFinanceOffset,
    handleAssign,
    handleClone,
    handleSaveEdits,
  };
}
