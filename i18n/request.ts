import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";

const VALID_LOCALES = ["ar", "en"] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: (typeof VALID_LOCALES)[number] = hasLocale(
    VALID_LOCALES,
    requested
  )
    ? (requested as (typeof VALID_LOCALES)[number])
    : "ar";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
