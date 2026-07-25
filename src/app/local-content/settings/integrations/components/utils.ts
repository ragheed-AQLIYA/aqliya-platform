import {
  Database,
  FileSpreadsheet,
  Globe,
  HardDrive,
  Server,
  Cable,
} from "lucide-react";

export interface Notification {
  type: "success" | "error";
  message: string;
}

export const PROVIDER_LABELS: Record<string, string> = {
  sap: "SAP ERP",
  oracle: "Oracle EBS",
  "microsoft-dynamics": "Microsoft Dynamics",
  odoo: "Odoo ERP",
  "csv-upload": "رفع ملف CSV",
  custom: "مخصص",
};

export const PROVIDER_ICONS: Record<string, typeof Database> = {
  sap: Server,
  oracle: Globe,
  "microsoft-dynamics": Database,
  odoo: Cable,
  "csv-upload": FileSpreadsheet,
  custom: HardDrive,
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "معلق",
  validated: "تم التحقق",
  needs_review: "بحاجة مراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
  imported: "تم الاستيراد",
};

export const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  validated: "secondary",
  needs_review: "destructive",
  approved: "default",
  rejected: "outline",
  imported: "default",
};

export const SYNC_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  running: "secondary",
  success: "default",
  partial: "outline",
  failed: "destructive",
};

export const SYNC_STATUS_LABELS: Record<string, string> = {
  running: "قيد التشغيل",
  success: "نجاح",
  partial: "جزئي",
  failed: "فشل",
};

export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(
  date: Date | string | null | undefined,
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toISOString().slice(0, 16).replace("T", " ");
  }
}
