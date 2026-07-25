"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FindingsFiltersProps {
  statusFilter: string;
  onStatusChange: (v: string) => void;
  severityFilter: string;
  onSeverityChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
}

export function FindingsFilters({
  statusFilter,
  onStatusChange,
  severityFilter,
  onSeverityChange,
  typeFilter,
  onTypeChange,
}: FindingsFiltersProps) {
  const t = useTranslations("audit.findings");

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={statusFilter}
        onValueChange={(v) => {
          if (v !== null) onStatusChange(v);
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder={t("filterStatus")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allStatuses")}</SelectItem>
          <SelectItem value="draft">{t("draft")}</SelectItem>
          <SelectItem value="open">{t("open")}</SelectItem>
          <SelectItem value="in_review">{t("inReview")}</SelectItem>
          <SelectItem value="accepted">{t("accepted")}</SelectItem>
          <SelectItem value="resolved">{t("resolved")}</SelectItem>
          <SelectItem value="dismissed">{t("dismissed")}</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={severityFilter}
        onValueChange={(v) => {
          if (v !== null) onSeverityChange(v);
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder={t("filterSeverity")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allSeverities")}</SelectItem>
          <SelectItem value="low">{t("low")}</SelectItem>
          <SelectItem value="medium">{t("medium")}</SelectItem>
          <SelectItem value="high">{t("high")}</SelectItem>
          <SelectItem value="critical">{t("critical")}</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={typeFilter}
        onValueChange={(v) => {
          if (v !== null) onTypeChange(v);
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t("filterType")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allTypes")}</SelectItem>
          <SelectItem value="material_misstatement">
            {t("materialMisstatement")}
          </SelectItem>
          <SelectItem value="control_deficiency">
            {t("controlDeficiency")}
          </SelectItem>
          <SelectItem value="disclosure_gap">{t("disclosureGap")}</SelectItem>
          <SelectItem value="observation">{t("observation")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
