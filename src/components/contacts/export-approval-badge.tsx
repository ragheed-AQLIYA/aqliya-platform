import { Badge } from "@/components/ui/badge";

interface ExportApprovalBadgeProps {
  exportStatus: string;
  sensitivityLevel: string;
}

export function ExportApprovalBadge({ exportStatus, sensitivityLevel }: ExportApprovalBadgeProps) {
  const statusMap: Record<string, { label: string; className: string }> = {
    none: {
      label: sensitivityLevel === "normal" ? "قابل للتصدير" : "يتطلب موافقة",
      className: sensitivityLevel === "normal"
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    },
    requested: {
      label: "بانتظار الموافقة",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    },
    approved: {
      label: "موافق على التصدير",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    },
    rejected: {
      label: "رفض التصدير",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    },
    exported: {
      label: "تم التصدير",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    },
  };

  const entry = statusMap[exportStatus] || statusMap.none;
  return <Badge className={entry.className}>{entry.label}</Badge>;
}
