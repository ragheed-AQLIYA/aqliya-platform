"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle } from "lucide-react"
import type { InvitationDetails } from "@/actions/registration-actions"

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "مدير",
  OPERATOR: "مشغّل",
  VIEWER: "مشاهد",
}

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [verifyError, setVerifyError] = useState(false)

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function verify() {
      try {
        const { verifyInvitationAction } = await import(
          "@/actions/registration-actions"
        )
        const result = await verifyInvitationAction(token)
        if (result) {
          setInvitation(result)
          setName(result.email.split("@")[0])
        } else {
          setVerifyError(true)
        }
      } catch {
        setVerifyError(true)
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    if (password !== confirmPassword) {
      setError("كلمة المرور وتأكيدها غير متطابقين")
      setSubmitting(false)
      return
    }

    try {
      const { acceptInvitationAction } = await import(
        "@/actions/registration-actions"
      )
      await acceptInvitationAction({ token, name, password })
      router.push("/login?accepted=true")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ غير متوقع. حاول مرة أخرى",
      )
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center p-8"
        dir="rtl"
      >
        <p className="text-muted-foreground">جارٍ التحقق من الدعوة...</p>
      </main>
    )
  }

  if (verifyError) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center p-8"
        dir="rtl"
      >
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle>الدعوة غير صالحة</CardTitle>
            <CardDescription>
              هذه الدعوة غير صالحة أو منتهية الصلاحية. يرجى التواصل مع مدير المنشأة
              للحصول على دعوة جديدة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push("/login")}
            >
              العودة إلى تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-8"
      dir="rtl"
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>قبول الدعوة للانضمام</CardTitle>
          <CardDescription>
            تمت دعوتك للانضمام إلى{" "}
            <span className="font-medium">{invitation?.organizationName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">البريد الإلكتروني</span>
              <span dir="ltr">{invitation?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الصلاحية</span>
              <Badge variant="secondary">
                {ROLE_LABELS[invitation?.role ?? ""] ?? invitation?.role}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                minLength={8}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب والدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
