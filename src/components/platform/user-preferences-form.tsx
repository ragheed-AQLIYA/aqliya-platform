"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Bell, BellOff } from "lucide-react";
import {
  saveUserPreferencesAction,
  type UserPreferences,
} from "@/actions/settings-actions";

interface UserPreferencesFormProps {
  initialPreferences: UserPreferences;
}

function applyTheme(theme: "light" | "dark") {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function UserPreferencesForm({
  initialPreferences,
}: UserPreferencesFormProps) {
  const pt = useTranslations("settings.preferences");
  const [locale, setLocale] = useState(initialPreferences.locale);
  const [theme, setTheme] = useState<"light" | "dark">(
    initialPreferences.theme,
  );
  const [notifications, setNotifications] = useState(
    initialPreferences.notifications,
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function persist(next: UserPreferences) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveUserPreferencesAction(next);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  function updateLocale(nextLocale: string) {
    setLocale(nextLocale);
    persist({ locale: nextLocale, theme, notifications });
  }

  function updateTheme(nextTheme: "light" | "dark") {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    persist({ locale, theme: nextTheme, notifications });
  }

  function updateNotifications(enabled: boolean) {
    setNotifications(enabled);
    persist({ locale, theme, notifications: enabled });
  }

  function resetDefaults() {
    const defaults: UserPreferences = {
      locale: "ar",
      theme: "light",
      notifications: true,
    };
    setLocale(defaults.locale);
    setTheme(defaults.theme);
    setNotifications(defaults.notifications);
    applyTheme(defaults.theme);
    persist(defaults);
  }

  return (
    <div className="space-y-6">
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
              disabled={pending}
              onClick={() => updateLocale(l)}
              aria-checked={locale === l}
              role="radio"
            >
              {pt(
                l === "ar" ? "arabic" : l === "en" ? "english" : "turkish",
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
            disabled={pending}
            onClick={() => updateTheme("light")}
            className="gap-2"
          >
            <Sun className="size-4" />
            {pt("light")}
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            disabled={pending}
            onClick={() => updateTheme("dark")}
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
            disabled={pending}
            onClick={() => updateNotifications(true)}
            className="gap-2"
          >
            <Bell className="size-4" />
            {pt("enabled")}
          </Button>
          <Button
            variant={!notifications ? "default" : "outline"}
            size="sm"
            disabled={pending}
            onClick={() => updateNotifications(false)}
            className="gap-2"
          >
            <BellOff className="size-4" />
            {pt("disabled")}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{pt("additional")}</p>

      {saved && (
        <p className="text-xs text-green-700">تم حفظ التفضيلات</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button
        variant="destructive"
        size="sm"
        type="button"
        disabled={pending}
        onClick={resetDefaults}
      >
        {pt("reset")}
      </Button>
    </div>
  );
}
