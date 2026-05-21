"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Bell, BellOff } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const pt = useTranslations("settings.preferences");

  const [locale, setLocale] = useState("ar");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] = useState(true);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.documentElement.classList.toggle("dark");
  }

  function resetDefaults() {
    document.documentElement.classList.remove("dark");
    setLocale("ar");
    setTheme("light");
    setNotifications(true);
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Badge variant="outline">Internal Preview</Badge>
      </div>

      <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
        <CardHeader>
          <CardTitle className="text-base">
            معاينة إعدادات عامة وليست وحدة تشغيلية مكتملة
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-900 dark:text-amber-200">
          هذه الصفحة تستخدم حالة محلية داخل المتصفح فقط. لا توجد طبقة حفظ أو
          إدارة إعدادات عامة معتمدة هنا، وهي ليست ضمن نطاق v0.1 التشغيلي.
        </CardContent>
      </Card>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">{t("account.heading")}</h2>
          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="name">{t("account.name")}</Label>
              <Input id="name" defaultValue="أحمد المنصوري" />
            </div>
            <div>
              <Label htmlFor="email">{t("account.email")}</Label>
              <Input id="email" type="email" defaultValue="ahmed@aqliya.com" />
            </div>
            <Button size="sm" variant="outline" type="button">
              حفظ محلي تجريبي فقط
            </Button>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {t("organization.heading")}
          </h2>
          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="orgName">{t("organization.name")}</Label>
              <Input id="orgName" defaultValue="AQLIYA" />
            </div>
            <Button size="sm" variant="outline" type="button">
              تحديث تجريبي فقط
            </Button>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {t("preferences.heading")}
          </h2>
          <Card className="p-4 space-y-6">
            <div>
              <Label>{pt("locale")}</Label>
              <div
                className="flex gap-2 mt-2"
                role="radiogroup"
                aria-label={pt("locale")}
              >
                {(["ar", "en", "tr"] as const).map((l) => (
                  <Button
                    key={l}
                    variant={locale === l ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocale(l)}
                    aria-checked={locale === l}
                    role="radio"
                  >
                    {pt(
                      l === "ar"
                        ? "arabic"
                        : l === "en"
                          ? "english"
                          : "turkish",
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>{pt("theme")}</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={toggleTheme}
                  className="gap-2"
                >
                  <Sun className="size-4" />
                  {pt("light")}
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={toggleTheme}
                  className="gap-2"
                >
                  <Moon className="size-4" />
                  {pt("dark")}
                </Button>
              </div>
            </div>

            <div>
              <Label>{pt("notifications")}</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button
                  variant={notifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotifications(true)}
                  className="gap-2"
                >
                  <Bell className="size-4" />
                  {pt("enabled")}
                </Button>
                <Button
                  variant={!notifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotifications(false)}
                  className="gap-2"
                >
                  <BellOff className="size-4" />
                  {pt("disabled")}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{pt("additional")}</p>

            <Button
              variant="destructive"
              size="sm"
              type="button"
              onClick={resetDefaults}
            >
              {pt("reset")}
            </Button>
          </Card>
        </section>
      </div>
    </main>
  );
}
