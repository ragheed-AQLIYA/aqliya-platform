import Link from "next/link";
import { FileX, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectNotFound() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileX className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-muted-foreground">
            المشروع غير موجود
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            هذا المشروع غير موجود أو تمت أرشفته. قد يكون قد أزيل من قبل فريقك.
          </p>
        </div>
        <Link
          href="/local-content/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة إلى المشاريع
        </Link>
      </CardContent>
    </Card>
  );
}
