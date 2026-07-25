"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePresentationPolicySettings } from "./components/presentation-policy/use-presentation-policy-settings";
import { PolicySelector } from "./components/presentation-policy/policy-selector";
import { ClonePolicyForm } from "./components/presentation-policy/clone-policy-form";
import { EditPolicyForm } from "./components/presentation-policy/edit-policy-form";
import { RebuildBanner } from "./components/presentation-policy/rebuild-banner";
import { PresentationPolicyViewer } from "@/components/audit/engagement/presentation-policy-viewer";
import type { PresentationPolicySummary } from "@/lib/audit/presentation/presentation-policy-service";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";

interface PresentationPolicySettingsProps {
  engagementId: string;
  policies: PresentationPolicySummary[];
  currentPolicyId: string | null;
  currentPolicy: PresentationPolicyRules;
}

export function PresentationPolicySettings(props: PresentationPolicySettingsProps) {
  const {
    policyId,
    setPolicyId,
    fsRebuild,
    error,
    pending,
    cloneName,
    setCloneName,
    clonePending,
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
  } = usePresentationPolicySettings(props);

  return (
    <div className="space-y-4">
      <Card dir="rtl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">سياسة العرض — التعيين والإدارة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PolicySelector
            policies={props.policies}
            policyId={policyId}
            onPolicyChange={setPolicyId}
            dirtyAssign={dirtyAssign}
            pending={pending}
            onAssign={handleAssign}
          />

          <ClonePolicyForm
            cloneName={cloneName}
            onCloneNameChange={setCloneName}
            clonePending={clonePending}
            onClone={handleClone}
          />

          {canEdit ? (
            <EditPolicyForm
              editRevenueExcl={editRevenueExcl}
              onEditRevenueExclChange={setEditRevenueExcl}
              editCorExcl={editCorExcl}
              onEditCorExclChange={setEditCorExcl}
              editCorPrefix={editCorPrefix}
              onEditCorPrefixChange={setEditCorPrefix}
              editOtherNet={editOtherNet}
              onEditOtherNetChange={setEditOtherNet}
              editFinanceOffset={editFinanceOffset}
              onEditFinanceOffsetChange={setEditFinanceOffset}
              pending={pending}
              onSave={handleSaveEdits}
            />
          ) : null}

          {fsRebuild ? <RebuildBanner fsRebuild={fsRebuild} /> : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <PresentationPolicyViewer
        policy={props.currentPolicy}
        policyId={props.currentPolicyId}
      />
    </div>
  );
}
