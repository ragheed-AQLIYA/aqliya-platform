"use client";

import { useTranslations } from "next-intl";
import { User, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Engagement } from "@/types/audit";

export function ApprovalPermissionsCard({
  engagement,
}: {
  engagement: Engagement | null;
}) {
  const t = useTranslations("audit.approval");
  const partner = engagement?.team?.find((t) => t.role === "partner");
  return (
    <Card className="rounded-[24px] border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-4" />
          {t("permission")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-2">
            <User className="size-4 text-muted-foreground" />
            <span>
              {t("requiredApprover")} <strong>{t("partner")}</strong>
              {partner?.userName ? ` (${partner.userName})` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" />
            <span>
              {t("riskLevel")}{" "}
              <strong>
                {(engagement?.engagementType as string) === "full_audit"
                  ? t("riskTierStandard")
                  : t("riskTierLimited")}
              </strong>{" "}
              -{" "}
              {engagement?.engagementType?.replace("_", " ") ??
                t("engagement")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
