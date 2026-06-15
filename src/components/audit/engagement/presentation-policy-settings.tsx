"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  assignEngagementPresentationPolicyAction,
  createOrgPresentationPolicyAction,
  updateOrgPresentationPolicyAction,
} from "@/actions/audit-presentation-policy-actions";
import type { PresentationPolicySummary } from "@/lib/audit/presentation/presentation-policy-service";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
import type { PresentationProfileRebuildResult } from "@/lib/audit/presentation/presentation-profile-rebuild-types";
import { PresentationPolicyViewer } from "@/components/audit/engagement/presentation-policy-viewer";

function parseGlList(value: string): string[] {
  return value
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function RebuildBanner({ fsRebuild }: { fsRebuild: PresentationProfileRebuildResult }) {
  if (fsRebuild.status === "rebuilt") {
    return (
      <p className="text-sm text-green-700" role="status">
        تم إعادة بناء القوائم بعد تغيير السياسة.
      </p>
    );
  }
  if (fsRebuild.status === "skipped_no_mappings") {
    return (
      <p className="text-sm text-amber-800" role="alert">
        تم حفظ السياسة. أعد بناء القوائم بعد إتمام ربط الحسابات.
      </p>
    );
  }
  return (
    <p className="text-sm text-destructive" role="alert">
      فشل إعادة البناء: {fsRebuild.errorMessage ?? "خطأ غير معروف"}
    </p>
  );
}

interface PresentationPolicySettingsProps {
  engagementId: string;
  policies: PresentationPolicySummary[];
  currentPolicyId: string | null;
  currentPolicy: PresentationPolicyRules;
}

export function PresentationPolicySettings({
  engagementId,
  policies,
  currentPolicyId,
  currentPolicy,
}: PresentationPolicySettingsProps) {
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

  return (
    <div className="space-y-4">
      <Card dir="rtl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">سياسة العرض — التعيين والإدارة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 max-w-md">
            <Label htmlFor="presentation-policy-select">السياسة المرتبطة</Label>
            <Select value={policyId} onValueChange={setPolicyId}>
              <SelectTrigger id="presentation-policy-select">
                <SelectValue placeholder="اختر سياسة" />
              </SelectTrigger>
              <SelectContent>
                {policies.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.isSystem ? " (نظام)" : " (مخصصة)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 items-end">
            <Button
              type="button"
              size="sm"
              disabled={!dirtyAssign || pending}
              onClick={handleAssign}
            >
              {pending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : null}
              تعيين السياسة وإعادة البناء
            </Button>
          </div>

          <div className="border-t pt-4 space-y-2">
            <Label htmlFor="clone-policy-name">نسخ سياسة مخصصة من الحالية</Label>
            <div className="flex flex-wrap gap-2 max-w-lg">
              <Input
                id="clone-policy-name"
                placeholder="مثال: Shalfa Policy v2"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
                className="max-w-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!cloneName.trim() || clonePending}
                onClick={handleClone}
              >
                {clonePending ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="ml-2 h-4 w-4" />
                )}
                إنشاء نسخة
              </Button>
            </div>
          </div>

          {canEdit ? (
            <div className="border-t pt-4 space-y-3 text-sm">
              <p className="font-medium">تحرير السياسة المخصصة</p>
              <div className="grid gap-2">
                <Label>استثناءات الإيراد (GL)</Label>
                <Input
                  value={editRevenueExcl}
                  onChange={(e) => setEditRevenueExcl(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label>استثناءات CoR (GL)</Label>
                <Input
                  value={editCorExcl}
                  onChange={(e) => setEditCorExcl(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label>بادئات CoR المستثناة</Label>
                <Input
                  value={editCorPrefix}
                  onChange={(e) => setEditCorPrefix(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>هدف صافي الدخل الآخر</Label>
                  <Input
                    value={editOtherNet}
                    onChange={(e) => setEditOtherNet(e.target.value)}
                  />
                </div>
                <div>
                  <Label>تسوية التمويل</Label>
                  <Input
                    value={editFinanceOffset}
                    onChange={(e) => setEditFinanceOffset(e.target.value)}
                  />
                </div>
              </div>
              <Button type="button" size="sm" disabled={pending} onClick={handleSaveEdits}>
                حفظ التعديلات وتطبيق
              </Button>
            </div>
          ) : null}

          {fsRebuild ? <RebuildBanner fsRebuild={fsRebuild} /> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <PresentationPolicyViewer policy={currentPolicy} policyId={currentPolicyId} />
    </div>
  );
}
