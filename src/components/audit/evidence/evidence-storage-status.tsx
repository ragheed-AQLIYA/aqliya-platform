import type { ReactNode } from "react";
import type { EvidenceObject } from "@/types/audit";
import { Badge } from "@/components/ui/badge";
import { CloudOff, FileCheck, FileQuestion } from "lucide-react";

export type EvidenceFileAvailability =
  | "request_only"
  | "stored"
  | "metadata_only";

export function getEvidenceFileAvailability(
  ev: EvidenceObject,
): EvidenceFileAvailability {
  if (ev.state === "missing" || ev.state === "requested") {
    return "request_only";
  }
  if (ev.storageKey && ev.fileHash) {
    return "stored";
  }
  return "metadata_only";
}

const availabilityConfig: Record<
  EvidenceFileAvailability,
  {
    label: string;
    hint: string;
    className: string;
    icon: ReactNode;
  }
> = {
  request_only: {
    label: "طلب فقط",
    hint: "لم يُرفع ملف بعد",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <FileQuestion className="size-3" />,
  },
  stored: {
    label: "ملف مخزّن",
    hint: "قابل للتنزيل",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <FileCheck className="size-3" />,
  },
  metadata_only: {
    label: "بيانات فقط",
    hint: "لا يوجد ملف في التخزين",
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: <CloudOff className="size-3" />,
  },
};

export function EvidenceStorageStatusBadge({
  evidence,
  size = "sm",
}: {
  evidence: EvidenceObject;
  size?: "sm" | "md";
}) {
  const availability = getEvidenceFileAvailability(evidence);
  const config = availabilityConfig[availability];

  return (
    <Badge
      variant="outline"
      className={`${config.className} flex items-center gap-1 w-fit ${size === "sm" ? "text-[10px]" : "text-xs"}`}
      title={config.hint}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
