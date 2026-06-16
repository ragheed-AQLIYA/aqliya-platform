"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Building2,
  Heart,
  Settings,
  Loader2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronDown,
  Save,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  getOrgHierarchyData,
  getOrgHealthData,
  getOrgSettingsData,
  setOrgSettingAction,
  deleteOrgSettingAction,
  KNOWN_SETTINGS_META,
  type OrgActionState,
} from "./actions"
import type { OrgHierarchyNode, OrgHealth } from "@/lib/platform/org-advanced"
import Link from "next/link"

export default function OrgAdvancedPage() {
  // Data state
  const [hierarchy, setHierarchy] = useState<OrgHierarchyNode[]>([])
  const [parentChain, setParentChain] = useState<OrgHierarchyNode[]>([])
  const [health, setHealth] = useState<OrgHealth | null>(null)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Settings edit state
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [settingError, setSettingError] = useState<string | null>(null)

  // New setting
  const [showNewSetting, setShowNewSetting] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  const fetchAll = useCallback(async () => {
    try {
      const [hierData, healthData, settingsData] = await Promise.all([
        getOrgHierarchyData(),
        getOrgHealthData(),
        getOrgSettingsData(),
      ])
      setHierarchy(hierData.tree)
      setParentChain(hierData.parentChain)
      setHealth(healthData)
      setSettings(settingsData)
    } catch {
      setError("فشل في تحميل بيانات المنظمة")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function handleSaveSetting(key: string, formData: FormData) {
    setSettingError(null)
    setSavingKey(key)
    formData.set("key", key)
    formData.set("value", editValue)

    const result = await setOrgSettingAction({ status: "idle" }, formData)
    setSavingKey(null)

    if (result.status === "success") {
      setEditingKey(null)
      await fetchAll()
    } else if (result.status === "error") {
      setSettingError(result.error)
    }
  }

  async function handleDeleteSetting(key: string) {
    setSettingError(null)
    const formData = new FormData()
    formData.set("key", key)
    const result = await deleteOrgSettingAction({ status: "idle" }, formData)
    if (result.status === "success") {
      await fetchAll()
    } else if (result.status === "error") {
      setSettingError(result.error)
    }
  }

  async function handleAddSetting(formData: FormData) {
    setSettingError(null)
    if (!newKey.trim()) {
      setSettingError("مفتاح الإعداد مطلوب")
      return
    }
    formData.set("key", newKey.trim())
    formData.set("value", newValue)

    const result = await setOrgSettingAction({ status: "idle" }, formData)
    if (result.status === "success") {
      setShowNewSetting(false)
      setNewKey("")
      setNewValue("")
      await fetchAll()
    } else if (result.status === "error") {
      setSettingError(result.error)
    }
  }

  function startEdit(key: string) {
    setEditingKey(key)
    setEditValue(settings[key] ?? "")
  }

  if (loading) {
    return (
      <main className="p-8 max-w-6xl mx-auto" dir="rtl">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">إعدادات المنظمة المتقدمة</h1>
        <Badge variant="outline">Admin</Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <Button variant="ghost" size="sm" className="mr-auto" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel — Hierarchy */}
        <div className="lg:col-span-1 space-y-6">
          {/* Org Tree */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                التسلسل الهرمي
              </CardTitle>
              <CardDescription>
                عرض التنظيم الهرمي للمنظمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parentChain.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">السلسلة الأصلية:</p>
                  <div className="space-y-1">
                    {[...parentChain].reverse().map((node, idx) => (
                      <div key={node.id} className="flex items-center gap-1 text-sm">
                        {idx > 0 && <ChevronLeft className="h-3 w-3 text-muted-foreground" />}
                        <Badge variant="outline" className="text-xs">
                          {"عقدة " + node.organizationId.slice(0, 6) + "..."}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          (مستوى {node.level})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mb-2">العقد في الشجرة:</p>
              {hierarchy.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  لا توجد عقد هرمية
                </p>
              ) : (
                <div className="space-y-2">
                  {hierarchy.map((node) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between rounded-md border p-2 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-mono text-xs truncate">
                          {"عقدة " + node.organizationId.slice(0, 10) + "..."}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        مستوى {node.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events Link */}
          <Link href="/settings/organization/advanced/events">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-sm">سجل أحداث دورة الحياة</CardTitle>
                <CardDescription>
                  عرض أحداث المنظمة وتتبع التغييرات
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Right Panel — Health + Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                صحة المنظمة
                {health && (
                  <Badge
                    variant={health.score >= 70 ? "default" : health.score >= 40 ? "secondary" : "destructive"}
                    className="mr-auto"
                  >
                    {health.score}/100
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                تقييم حالة المنظمة بناءً على 5 معايير
              </CardDescription>
            </CardHeader>
            <CardContent>
              {health && (
                <div className="space-y-3">
                  {Object.values(health.breakdown).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.score >= item.max ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{item.detail}</span>
                      </div>
                      <span className="text-sm font-mono">
                        {item.score}/{item.max}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات المنظمة
              </CardTitle>
              <CardDescription>
                إدارة إعدادات المنظمة الرئيسية. جميع التغييرات مسجلة في سجل التدقيق.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settingError && (
                <div className="rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-3 mb-4 text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {settingError}
                </div>
              )}

              {/* Known Settings */}
              <div className="space-y-3">
                {Object.entries(KNOWN_SETTINGS_META).map(([key, meta]) => {
                  const currentValue = settings[key] ?? ""
                  return (
                    <div
                      key={key}
                      className="rounded-md border p-3"
                    >
                      {editingKey === key ? (
                        <form action={(fd) => handleSaveSetting(key, fd)} className="space-y-2">
                          <Label className="text-xs">{meta.label}</Label>
                          {meta.type === "boolean" ? (
                            <Select value={editValue} onValueChange={setEditValue}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">نعم</SelectItem>
                                <SelectItem value="false">لا</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type={meta.type === "number" ? "number" : "text"}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                            />
                          )}
                          <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={savingKey === key}>
                              {savingKey === key ? (
                                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 ml-1" />
                              )}
                              حفظ
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingKey(null)}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{meta.label}</span>
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {key}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {meta.type === "boolean" ? (
                                <Badge variant={currentValue === "true" ? "default" : "outline"}>
                                  {currentValue === "true" ? "مفعل" : "معطل"}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground font-mono">
                                  {currentValue || KNOWN_SETTINGS_META[key]?.label}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => startEdit(key)}>
                              تعديل
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Divider */}
              <div className="my-4 border-t" />

              {/* Add Custom Setting */}
              {showNewSetting ? (
                <form action={handleAddSetting} className="space-y-3 p-4 rounded-md border">
                  <p className="text-sm font-medium">إعداد مخصص جديد</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">المفتاح</Label>
                      <Input
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder="مثال: custom_setting"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">القيمة</Label>
                      <Input
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="القيمة"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">إضافة</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowNewSetting(false)}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowNewSetting(true)} className="w-full">
                  إضافة إعداد مخصص
                </Button>
              )}

              {/* Custom Settings (not in known) */}
              {Object.keys(settings).filter((k) => !(k in KNOWN_SETTINGS_META)).length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">إعدادات مخصصة:</p>
                  {Object.entries(settings)
                    .filter(([k]) => !(k in KNOWN_SETTINGS_META))
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between rounded-md border p-2">
                        <div className="min-w-0">
                          <span className="text-sm font-mono text-xs">{key}</span>
                          <span className="text-sm text-muted-foreground mr-2">{value}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSetting(key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
