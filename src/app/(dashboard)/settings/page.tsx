import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">الإعدادات</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">إعدادات الحساب</h2>
          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" defaultValue="أحمد المنصوري" />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" defaultValue="ahmed@aqliya.com" />
            </div>
            <Button size="sm">تحديث الحساب</Button>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">إعدادات المؤسسة</h2>
          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="orgName">اسم المؤسسة</Label>
              <Input id="orgName" defaultValue="AQLIYA" />
            </div>
            <Button size="sm">تحديث المؤسسة</Button>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">تفضيلات النظام</h2>
          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="language">اللغة</Label>
              <Input id="language" defaultValue="العربية" disabled />
            </div>
            <div>
              <Label htmlFor="timezone">المنطقة الزمنية</Label>
              <Input id="timezone" defaultValue="Asia/Riyadh" disabled />
            </div>
            <p className="text-xs text-muted-foreground">تفضيلات إضافية قريباً</p>
          </Card>
        </section>
      </div>
    </main>
  )
}
