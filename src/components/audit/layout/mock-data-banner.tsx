import { isUsingMockData, ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK } from "@/lib/audit/services/common";
import { isUsingDemoFallback } from "@/lib/audit/actor-context";

/**
 * Mock Data Warning Banner
 *
 * Surfaces a visible warning when AuditOS is operating on mock/demo data
 * instead of real database records. This ensures users never mistake
 * fabricated data for real customer data.
 *
 * Two conditions trigger the banner:
 * 1. tryDb has fallen back to mock data (AUDIT_ALLOW_MOCK_FALLBACK=true)
 * 2. Auth has fallen back to demo actor (AUDIT_DEV_FALLBACK_ENABLED=true)
 */
export function MockDataBanner() {
  const mockActive = isUsingMockData();
  const demoFallback = isUsingDemoFallback();
  const mockAllowed = ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK;

  // Don't render if neither condition is active
  if (!mockActive && !demoFallback) {
    // Still show a subtle indicator if mock fallback is ENABLED but not yet triggered
    if (mockAllowed) {
      return (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
          role="status"
          aria-label="Mock fallback enabled indicator"
        >
          <span className="font-medium">
            ⚠️ وضع البيانات التجريبية مفعّل — Mock fallback is ENABLED
          </span>
          <span className="mr-2 text-amber-600 dark:text-amber-400">
            إذا فشل الاتصال بقاعدة البيانات، سيتم استخدام بيانات تجريبية.
          </span>
        </div>
      );
    }
    return null;
  }

  const reasons: string[] = [];
  if (mockActive) {
    reasons.push("البيانات المعروضة هي بيانات تجريبية وليست بيانات حقيقية");
  }
  if (demoFallback) {
    reasons.push("المستخدم الحالي هو مستخدم تجريبي (Demo fallback)");
  }

  return (
    <div
      className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
      role="alert"
      aria-label="Mock data active warning"
    >
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none" aria-hidden="true">
          ⛔
        </span>
        <div className="flex-1">
          <p className="font-bold">
            تنبيه: أنت تستخدم بيانات تجريبية
          </p>
          <p className="mt-1 text-red-700 dark:text-red-300">
            Warning: You are viewing demo data, not real data.
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
            {reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            لتعطيل هذا الوضع، تأكد من اتصال قاعدة البيانات وأوقف AUDIT_ALLOW_MOCK_FALLBACK و AUDIT_DEV_FALLBACK_ENABLED.
            <br />
            To disable, ensure database connectivity and unset AUDIT_ALLOW_MOCK_FALLBACK and AUDIT_DEV_FALLBACK_ENABLED.
          </p>
        </div>
      </div>
    </div>
  );
}
