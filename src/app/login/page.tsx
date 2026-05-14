"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError("بريد إلكتروني أو كلمة مرور غير صحيحة")
      } else if (res?.ok) {
        const verifyRes = await fetch("/api/auth/session")
        const session = await verifyRes.json()

        if (session?.user) {
          window.location.href = "/"
        } else {
          setError("تم تسجيل الدخول ولكن الجلسة لم تُنشأ. حاول مرة أخرى.")
        }
      }
    } catch {
      setError("حدث خطأ في الاتصال. حاول مرة أخرى.")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8" dir="rtl">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>الدخول إلى مساحة العمل المؤسسية</CardTitle>
          <CardDescription>أدخل بياناتك للوصول إلى بيئة تشغيل محكومة تربط العمل بالصلاحيات، المراجعة، والأثر التشغيلي.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
