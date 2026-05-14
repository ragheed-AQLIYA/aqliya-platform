import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldBan } from "lucide-react"
import Link from "next/link"

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldBan className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>الوصول غير مصرح</CardTitle>
          <CardDescription>
            ليس لديك صلاحية للوصول إلى هذا المسار أو هذه الوحدة التشغيلية.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            إذا كنت تعتقد أن الوصول مطلوب لطبيعة عملك، تواصل مع مسؤول المساحة أو مدير النظام.
          </p>
          <Link href="/">
            <Button>العودة إلى مساحة البداية</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
