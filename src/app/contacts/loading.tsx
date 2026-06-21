import { Loader2 } from "lucide-react";

export default function ContactsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">جاري تحميل جهات الاتصال...</p>
      </div>
    </div>
  );
}
