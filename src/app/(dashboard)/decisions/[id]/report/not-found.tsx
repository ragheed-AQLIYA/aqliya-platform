import Link from "next/link";
import { ArrowLeft, FileBarChart } from "lucide-react";

export default function ReportNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4" dir="rtl">
      <div className="rounded-full bg-muted p-4">
        <FileBarChart className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">التقرير غير موجود</h2>
        <p className="text-sm text-muted-foreground">
          لم نتمكن من العثور على التقرير المطلوبة أو ليس لديك صلاحية الوصول إليها.
        </p>
        <p className="text-xs text-muted-foreground/60">
          التقرير غير موجود أو ليس لديك صلاحية الوصول.
        </p>
      </div>
      <Link
        href=".."
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        العودة
      </Link>
    </div>
  );
}
