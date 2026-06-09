import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const VALID_LOCALES = ["ar", "en"] as const;
type Locale = (typeof VALID_LOCALES)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = VALID_LOCALES.includes(cookie as Locale)
    ? (cookie as Locale)
    : "ar";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
