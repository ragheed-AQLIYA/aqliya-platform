import { getUserPreferences } from "@/actions/user-preferences-actions"
import { PreferencesForm } from "@/components/settings/preferences-form"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const preferences = await getUserPreferences()

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">الإعدادات</h1>
        <p className="text-muted-foreground text-sm">إدارة تفضيلاتك الشخصية واللغة والمظهر والإشعارات</p>
      </div>

      <PreferencesForm initialPreferences={preferences} />
    </main>
  )
}
