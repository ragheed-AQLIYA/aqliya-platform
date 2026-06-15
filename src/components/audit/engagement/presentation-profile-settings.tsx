"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  updateEngagementPresentationProfileAction,
} from "@/actions/audit-actions";
import { rebuildFinancialStatementsV2Action } from "@/actions/audit-fs-actions";
import {
  PresentationProfile,
  PRESENTATION_PROFILE_LABELS,
  resolvePresentationProfile,
} from "@/lib/audit/presentation/presentation-profile";
import type { PresentationProfileRebuildResult } from "@/lib/audit/presentation/presentation-profile-rebuild-types";

interface PresentationProfileSettingsProps {
  engagementId: string;
  presentationProfile?: string | null;
  presentationProfileVersion?: string | null;
}

function RebuildStatusBanner({
  engagementId,
  fsRebuild,
  onManualRebuild,
  manualPending,
}: {
  engagementId: string;
  fsRebuild: PresentationProfileRebuildResult;
  onManualRebuild: () => void;
  manualPending: boolean;
}) {
  if (fsRebuild.status === "rebuilt") {
    return (
      <div
        className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900"
        role="status"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">تم إعادة بناء القوائم المالية</p>
          <p className="text-xs text-green-800 mt-1">
            طُبّقت سياسة العرض الجديدة على{" "}
            {fsRebuild.statementCount ?? 3} قائمة (
            {fsRebuild.method === "v2" ? "محرك v2" : "محرك v1"}).
          </p>
          <Link
            href={`/audit/engagements/${engagementId}/statements`}
            className="text-xs underline mt-1 inline-block"
          >
            عرض القوائم المالية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-2 flex-1">
        <p className="font-medium">مطلوب: إعادة بناء القوائم المالية</p>
        {fsRebuild.status === "skipped_no_mappings" ? (
          <p className="text-xs">
            تم حفظ سياسة العرض. لا توجد حسابات مربوطة بعد — بعد إتمام الربط،
            أعد بناء القوائم لتطبيق العرض الجديد.
          </p>
        ) : (
          <p className="text-xs">
            تم حفظ سياسة العرض لكن إعادة البناء التلقائي فشلت
            {fsRebuild.errorMessage ? `: ${fsRebuild.errorMessage}` : "."}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={
              manualPending || fsRebuild.status === "skipped_no_mappings"
            }
            onClick={onManualRebuild}
          >
            {manualPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري إعادة البناء…
              </>
            ) : (
              <>
                <RefreshCw className="ml-2 h-4 w-4" />
                إعادة بناء القوائم الآن
              </>
            )}
          </Button>
          <Link
            href={`/audit/engagements/${engagementId}/statements`}
            className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent"
          >
            صفحة القوائم
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PresentationProfileSettings({
  engagementId,
  presentationProfile,
  presentationProfileVersion,
}: PresentationProfileSettingsProps) {
  const resolved = resolvePresentationProfile(presentationProfile);
  const [profile, setProfile] = useState<PresentationProfile>(resolved);
  const [version, setVersion] = useState(presentationProfileVersion ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fsRebuild, setFsRebuild] =
    useState<PresentationProfileRebuildResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [manualPending, startManualTransition] = useTransition();

  const dirty = profile !== resolved;

  const handleSave = () => {
    setError(null);
    setFsRebuild(null);
    startTransition(async () => {
      try {
        const result = await updateEngagementPresentationProfileAction({
          engagementId,
          presentationProfile: profile,
        });
        setVersion(result.presentationProfileVersion ?? "");
        setFsRebuild(result.fsRebuild);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save profile");
      }
    });
  };

  const handleManualRebuild = () => {
    startManualTransition(async () => {
      try {
        await rebuildFinancialStatementsV2Action(engagementId);
        setFsRebuild({
          status: "rebuilt",
          method: "v2",
          statementCount: 4,
        });
      } catch (e) {
        setFsRebuild({
          status: "failed",
          errorMessage: e instanceof Error ? e.message : String(e),
        });
      }
    });
  };

  return (
    <Card dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">إعدادات عرض قائمة الدخل</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          يتحكم في طريقة عرض بنود الإيرادات والتكاليف — لا يغيّر صافي الربح
          المحاسبي. بعد تغيير السياسة يجب إعادة بناء القوائم المالية.
        </p>
        <div className="grid gap-2 max-w-sm">
          <Label htmlFor="presentation-profile">سياسة العرض</Label>
          <Select
            value={profile}
            onValueChange={(value) => {
              setProfile(value as PresentationProfile);
              setFsRebuild(null);
            }}
          >
            <SelectTrigger id="presentation-profile">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PresentationProfile.GENERIC}>
                {PRESENTATION_PROFILE_LABELS[PresentationProfile.GENERIC].ar} (
                {PRESENTATION_PROFILE_LABELS[PresentationProfile.GENERIC].en})
              </SelectItem>
              <SelectItem value={PresentationProfile.PILOT_AUDITED}>
                {
                  PRESENTATION_PROFILE_LABELS[PresentationProfile.PILOT_AUDITED]
                    .ar
                }{" "}
                (
                {
                  PRESENTATION_PROFILE_LABELS[PresentationProfile.PILOT_AUDITED]
                    .en
                }
                )
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {version ? (
          <p className="text-xs text-muted-foreground">
            الإصدار المحفوظ: <span className="font-mono">{version}</span>
          </p>
        ) : null}
        {fsRebuild ? (
          <RebuildStatusBanner
            engagementId={engagementId}
            fsRebuild={fsRebuild}
            onManualRebuild={handleManualRebuild}
            manualPending={manualPending}
          />
        ) : null}
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
        <Button
          type="button"
          size="sm"
          disabled={!dirty || pending}
          onClick={handleSave}
        >
          {pending ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ وإعادة البناء…
            </>
          ) : (
            "حفظ سياسة العرض"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
