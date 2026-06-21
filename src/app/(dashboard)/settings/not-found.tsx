import Link from "next/link";
import { Settings } from "lucide-react";

export default function SettingsNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4" dir="rtl">
      <div className="rounded-full bg-muted p-4">
        <Settings className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">صفحة الإعدادات غير موجودة</h2>
        <p className="text-sm text-muted-foreground">
          صفحة الإعدادات المطلوبة غير متوفرة. قد يكون المسار غير صحيح.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Settings page not found. The path may be incorrect.
        </p>
      </div>
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        العودة إلى الإعدادات
      </Link>
    </div>
  );
}
