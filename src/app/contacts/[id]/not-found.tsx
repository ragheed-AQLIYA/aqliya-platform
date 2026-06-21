import Link from "next/link";
import { UserX } from "lucide-react";

export default function ContactNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4" dir="rtl">
      <div className="rounded-full bg-muted p-4">
        <UserX className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">جهة الاتصال غير موجودة</h2>
        <p className="text-sm text-muted-foreground">
          لم نتمكن من العثور على جهة الاتصال المطلوبة. قد يكون المعرّف غير صحيح أو تم حذف السجل.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Contact not found. The record may have been deleted or the ID is invalid.
        </p>
      </div>
      <Link
        href="/contacts"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        العودة إلى جهات الاتصال
      </Link>
    </div>
  );
}
