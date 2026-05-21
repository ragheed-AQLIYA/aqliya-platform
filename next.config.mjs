import createNextIntlPlugin from "next-intl/plugin"
import withBundleAnalyzer from "@next/bundle-analyzer"

let withSentryConfig

try {
  const sentry = await import("@sentry/nextjs")
  withSentryConfig = sentry.withSentryConfig
} catch {
  withSentryConfig = (config) => config
}

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const analyze = process.env.ANALYZE === "true"

const bundleAnalyzer = withBundleAnalyzer({
  enabled: analyze,
  openAnalyzer: false,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "pdfkit",
  ],

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons", "recharts"],
  },
}

export default withSentryConfig(bundleAnalyzer(withNextIntl(nextConfig)))
