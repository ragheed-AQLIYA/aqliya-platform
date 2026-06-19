import Link from "next/link";
import { Building2 } from "lucide-react";

export default function OrganizationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="rounded-full bg-muted p-4">
        <Building2 className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">المؤسسة غير موجودة</h2>
        <p className="text-sm text-muted-foreground">
          لم نتمكن من العثور على المؤسسة المطلوبة. قد يكون معرف المؤسسة غير صحيح أو
          تم حذفها.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Organization not found. The ID may be incorrect or the organization was
          deleted.
        </p>
      </div>
      <Link
        href="/organizations"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        العودة إلى المؤسسات
      </Link>
    </div>
  );
}
