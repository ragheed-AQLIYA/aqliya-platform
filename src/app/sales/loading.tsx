import { SALES_LOADING_MESSAGE_AR } from "@/lib/sales/sales-ux-copy";

export default function SalesLoading() {
  return (
    <div
      className="flex min-h-[12rem] items-center justify-center text-sm text-muted-foreground"
      dir="rtl"
      role="status"
      aria-live="polite"
    >
      {SALES_LOADING_MESSAGE_AR}
    </div>
  );
}
