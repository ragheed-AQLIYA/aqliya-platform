"use client";

import { UserCheck, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusLabels, statusColors } from "./constants";
import { KycCard } from "./kyc-card";
import { RiskCard } from "./risk-card";
import { DecisionCard } from "./decision-card";
import type { KycData, RiskFactor } from "./use-acceptance-workflow";

interface ProspectDetailTabProps {
  prospect: any;
  submitting: boolean;
  kycData: KycData;
  riskFactors: RiskFactor[];
  decisionValue: string;
  decisionRationale: string;
  onKycDataChange: React.Dispatch<React.SetStateAction<KycData>>;
  onRiskFactorsChange: React.Dispatch<React.SetStateAction<RiskFactor[]>>;
  onDecisionValueChange: (v: string) => void;
  onDecisionRationaleChange: (v: string) => void;
  onSubmitKyc: () => Promise<void>;
  onSubmitRisk: () => Promise<void>;
  onSubmitDecision: () => Promise<void>;
}

export function ProspectDetailTab({
  prospect,
  submitting,
  kycData,
  riskFactors,
  decisionValue,
  decisionRationale,
  onKycDataChange,
  onRiskFactorsChange,
  onDecisionValueChange,
  onDecisionRationaleChange,
  onSubmitKyc,
  onSubmitRisk,
  onSubmitDecision,
}: ProspectDetailTabProps) {
  if (!prospect) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{prospect.companyName}</h2>
                <Badge className={statusColors[prospect.status] ?? ""}>
                  {statusLabels[prospect.status] ?? prospect.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {prospect.industry} | {prospect.source} | منذ{" "}
                {new Date(prospect.createdAt).toLocaleDateString("ar-SA")}
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            {prospect.contactName && (
              <span className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                {prospect.contactName}
              </span>
            )}
            {prospect.contactEmail && <span>{prospect.contactEmail}</span>}
            {prospect.estimatedFee && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {prospect.estimatedFee.toLocaleString()} SAR
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <KycCard
          prospect={prospect}
          submitting={submitting}
          kycData={kycData}
          onKycDataChange={onKycDataChange}
          onSubmit={onSubmitKyc}
        />
        <RiskCard
          prospect={prospect}
          submitting={submitting}
          riskFactors={riskFactors}
          onRiskFactorsChange={onRiskFactorsChange}
          onSubmit={onSubmitRisk}
        />
        <DecisionCard
          prospect={prospect}
          submitting={submitting}
          decisionValue={decisionValue}
          decisionRationale={decisionRationale}
          onDecisionValueChange={onDecisionValueChange}
          onDecisionRationaleChange={onDecisionRationaleChange}
          onSubmit={onSubmitDecision}
        />
      </div>
    </div>
  );
}
