"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserPreferences } from "@/actions/user-preferences-actions"
import type { UserPreferences } from "@/actions/user-preferences-actions"

interface PreferencesFormProps {
  initialPreferences: UserPreferences
}

export function PreferencesForm({ initialPreferences }: PreferencesFormProps) {
  const [prefs, setPrefs] = useState(initialPreferences)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    try {
      await updateUserPreferences(prefs)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Language */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">اللغة</h2>
        <div className="flex gap-4">
          {[
            { value: "ar" as const, label: "العربية" },
            { value: "en" as const, label: "English" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPrefs({ ...prefs, language: opt.value })}
              className={`rounded-lg border px-6 py-3 text-sm ${
                prefs.language === opt.value
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">المظهر</h2>
        <div className="flex gap-4">
          {[
            { value: "light" as const, label: "فاتح" },
            { value: "dark" as const, label: "داكن" },
            { value: "system" as const, label: "تلقائي" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPrefs({ ...prefs, theme: opt.value })}
              className={`rounded-lg border px-6 py-3 text-sm ${
                prefs.theme === opt.value
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">الإشعارات</h2>
        <div className="space-y-3">
          {[
            { key: "email" as const, label: "الإشعارات عبر البريد الإلكتروني" },
            { key: "inApp" as const, label: "الإشعارات داخل المنصة" },
            { key: "taskAssigned" as const, label: "عند تعيين مهمة لي" },
            { key: "reviewRequested" as const, label: "عند طلب مراجعة" },
            { key: "approvalRequired" as const, label: "عند الحاجة إلى اعتماد" },
            { key: "systemUpdates" as const, label: "تحديثات النظام" },
          ].map((opt) => (
            <label
              key={opt.key}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-sm">{opt.label}</span>
              <button
                onClick={() =>
                  setPrefs({
                    ...prefs,
                    notifications: {
                      ...prefs.notifications,
                      [opt.key]: !prefs.notifications[opt.key],
                    },
                  })
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  prefs.notifications[opt.key] ? "bg-primary" : "bg-muted"
                }`}
                aria-label={opt.label}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    prefs.notifications[opt.key]
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </section>

      {/* Timezone */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">المنطقة الزمنية</h2>
        <select
          value={prefs.timezone}
          onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
          className="w-full rounded-lg border bg-background p-2.5 text-sm"
          aria-label="المنطقة الزمنية"
        >
          <option value="Asia/Riyadh">الرياض (UTC+3)</option>
          <option value="Asia/Dubai">دبي (UTC+4)</option>
          <option value="Asia/Kuwait">الكويت (UTC+3)</option>
          <option value="Asia/Manama">البحرين (UTC+3)</option>
          <option value="Asia/Qatar">قطر (UTC+3)</option>
          <option value="Europe/London">لندن (UTC+0)</option>
          <option value="America/New_York">نيويورك (UTC-5)</option>
        </select>
      </section>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {saving ? "جار الحفظ..." : saved ? "تم الحفظ ✓" : "حفظ التغييرات"}
      </button>
    </div>
  )
}
