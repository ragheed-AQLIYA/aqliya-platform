"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const router = useRouter()
  const [orgName, setOrgName] = useState("")
  const [adminName, setAdminName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("كلمة المرور وتأكيدها غير متطابقين")
      setLoading(false)
      return
    }

    try {
      const { registerTenantAction } = await import(
        "@/actions/registration-actions"
      )
      await registerTenantAction({
        organizationName: orgName,
        adminName,
        adminEmail: email,
        password,
      })

      router.push("/login?registered=true")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ غير متوقع. حاول مرة أخرى.",
      )
      setLoading(false)
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-8"
      dir="rtl"
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>إنشاء منشأة مؤسسية جديدة</CardTitle>
          <CardDescription>
            أنشئ مساحة العمل المؤسسية المحكومة الخاصة بمنشأتك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">اسم المنشأة</Label>
              <Input
                id="org-name"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="مثال: شركة التقنية المتطورة"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-name">اسم المدير</Label>
              <Input
                id="admin-name"
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="الاسم الكامل"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 أحرف على الأقل"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور"
                minLength={8}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "جارٍ إنشاء المنشأة..." : "إنشاء المنشأة"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <a href="/login" className="underline hover:text-foreground">
              تسجيل الدخول
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
