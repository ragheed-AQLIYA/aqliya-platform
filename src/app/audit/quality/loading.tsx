import { Loader2 } from "lucide-react";

export default function QualityLoading() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">جاري تحميل نظام الجودة...</p>
      </div>
    </div>
  );
}
