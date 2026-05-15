import createMiddleware from "next-intl/middleware"

export default createMiddleware({
  locales: ["ar", "en", "tr"],
  defaultLocale: "ar",
  localePrefix: "never",
})

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|brand|.*\\..*).*)"],
}
