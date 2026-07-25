export const AR = {
  pageTitle: "إعدادات CRM",
  pageDesc: "إدارة الاتصالات بأنظمة CRM الخارجية والمزامنة",
  noConnections: "لا توجد اتصالات CRM بعد",
  noConnectionsDesc: "أضف اتصالاً بالزر أعلاه لبدء مزامنة البيانات",
  addConnection: "إضافة اتصال CRM",
  editConnection: "تعديل اتصال CRM",
  connectionDetail: "تفاصيل الاتصال",
  connectionLabel: "اسم الاتصال",
  provider: "النظام",
  apiEndpoint: "رابط API",
  accessToken: "رمز الوصول",
  refreshToken: "رمز التحديث",
  apiKey: "مفتاح API",
  apiVersion: "إصدار API",
  syncInterval: "فترة المزامنة (دقائق)",
  conflictPolicy: "سياسة التعارض",
  crmWins: "CRM هو الأساس",
  localWins: "النظام المحلي هو الأساس",
  manual: "يدوي",
  save: "حفظ",
  cancel: "إلغاء",
  edit: "تعديل",
  delete: "حذف",
  testConnection: "اختبار الاتصال",
  testing: "جارٍ الاختبار...",
  syncNow: "مزامنة الآن",
  syncing: "جارٍ المزامنة...",
  autoSync: "المزامنة التلقائية",
  enable: "تفعيل",
  disable: "إيقاف",
  lastSync: "آخر مزامنة",
  never: "لم يتم",
  status: "الحالة",
  connected: "متصل",
  error: "خطأ",
  disabled: "معطل",
  testingStatus: "اختبار",
  lastSyncStatus: "آخر مزامنة",
  syncHistory: "سجل المزامنة",
  date: "التاريخ",
  recordsCreated: "تم الإنشاء",
  recordsUpdated: "تم التحديث",
  recordsFailed: "فشل",
  recordsTotal: "الإجمالي",
  resourceType: "النوع",
  direction: "الاتجاه",
  import: "استيراد",
  export: "تصدير",
  success: "ناجح",
  partial: "جزئي",
  failed: "فشل",
  running: "قيد التشغيل",
  confirmDelete: "هل أنت متأكد من حذف هذا الاتصال؟",
  confirmDeleteDesc: "سيؤدي الحذف إلى إزالة الاتصال وجميع سجلات المزامنة المرتبطة به",
  createdSuccess: "تم إنشاء الاتصال بنجاح",
  updatedSuccess: "تم تحديث الاتصال بنجاح",
  deletedSuccess: "تم حذف الاتصال بنجاح",
  syncTriggered: "تم بدء المزامنة",
  testSuccess: "تم اختبار الاتصال بنجاح",
  testFailed: "فشل اختبار الاتصال",
  toggleFailed: "فشل تغيير حالة المزامنة",
  errorOccurred: "حدث خطأ",
  retry: "إعادة المحاولة",
  loadError: "تعذر تحميل الاتصالات",
  allTypes: "الكل",
  showHistory: "سجل المزامنة",
  noSyncLogs: "لا توجد سجلات مزامنة",
  details: "التفاصيل",
  providerHubspot: "HubSpot",
  providerSalesforce: "Salesforce",
  providerApollo: "Apollo",
  providerCustom: "مخصص",
  syncEnabled: "المزامنة مفعلة",
  syncDisabled: "المزامنة معطلة",
  conflictPolicyLabel: "سياسة التعارض",
};

export type ProviderType = "hubspot" | "salesforce" | "apollo" | "custom";

export interface ConnectionCard {
  id: string;
  provider: string;
  label: string;
  syncEnabled: boolean;
  syncIntervalMin: number | null;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
  conflictPolicy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncLogEntry {
  id: string;
  resourceType: string;
  direction: string;
  status: string;
  totalRecords: number;
  createdRecords: number;
  updatedRecords: number;
  failedRecords: number;
  skippedRecords: number;
  errorDetails: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface ConnectionFormData {
  provider: ProviderType;
  label: string;
  apiEndpoint: string;
  accessToken: string;
  refreshToken: string;
  apiKey: string;
  apiVersion: string;
  syncIntervalMin: number;
  conflictPolicy: string;
}

export const EMPTY_FORM: ConnectionFormData = {
  provider: "hubspot",
  label: "",
  apiEndpoint: "",
  accessToken: "",
  refreshToken: "",
  apiKey: "",
  apiVersion: "",
  syncIntervalMin: 60,
  conflictPolicy: "crm_wins",
};

export interface Notification {
  type: "success" | "error";
  message: string;
}

export function getProviderLabel(p: string): string {
  const map: Record<string, string> = {
    hubspot: AR.providerHubspot,
    salesforce: AR.providerSalesforce,
    apollo: AR.providerApollo,
    custom: AR.providerCustom,
  };
  return map[p] ?? p;
}

export function getStatusBadgeVariant(
  status: string | null | undefined
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "success" || status === "connected") return "default";
  if (status === "testing" || status === "running") return "secondary";
  if (status === "error" || status === "failed") return "destructive";
  return "outline";
}

export function getStatusLabel(status: string | null | undefined): string {
  if (status === "success" || status === "connected") return AR.connected;
  if (status === "testing") return AR.testingStatus;
  if (status === "error" || status === "failed") return AR.error;
  if (status === "disabled") return AR.disabled;
  if (status === "running") return AR.running;
  if (status === "partial") return AR.partial;
  return status ?? AR.disabled;
}

export function getProviderColor(p: string): string {
  const map: Record<string, string> = {
    hubspot:
      "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950 dark:border-orange-800",
    salesforce:
      "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800",
    apollo:
      "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950 dark:border-purple-800",
    custom:
      "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-950 dark:border-gray-800",
  };
  return map[p] ?? map.custom;
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
