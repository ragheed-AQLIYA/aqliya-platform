import type { Notification } from "./constants";

export function NotificationBar({
  notification,
  onDismiss,
}: {
  notification: Notification | null;
  onDismiss: () => void;
}) {
  if (!notification) return null;
  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
        notification.type === "success"
          ? "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
          : "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      }`}
      role="alert"
    >
      <span>{notification.message}</span>
      <button
        onClick={onDismiss}
        className="mr-2 opacity-70 hover:opacity-100"
        aria-label="إغلاق"
      >
        ✕
      </button>
    </div>
  );
}
