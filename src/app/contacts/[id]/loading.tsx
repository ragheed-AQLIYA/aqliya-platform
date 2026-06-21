import { Loader2, UserCircle2 } from "lucide-react";

export default function ContactDetailLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
      <div className="text-center space-y-4">
        <div className="relative mx-auto h-12 w-12">
          <UserCircle2 className="h-12 w-12 text-primary/40" />
          <Loader2 className="absolute inset-0 m-auto h-5 w-5 animate-spin text-primary" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">جارٍ تحميل تفاصيل جهة الاتصال...</p>
        <p className="text-sm text-muted-foreground/60">Loading contact details...</p>
      </div>
    </div>
  );
}
