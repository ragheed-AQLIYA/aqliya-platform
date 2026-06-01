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

// CSP script-src: drop 'unsafe-eval' in production, keep it in dev for HMR.
// 'unsafe-inline' is retained for now (full removal needs a nonce-based CSP).
const cspScriptSrc =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"

const bundleAnalyzer = withBundleAnalyzer({
  enabled: analyze,
  openAnalyzer: false,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/executive-briefing",
        destination: "/executive-brief",
        permanent: true,
      },
      {
        source: "/sunbul",
        destination: "/workflowos",
        permanent: true,
      },
      {
        source: "/sunbul/admin",
        destination: "/workflowos/admin",
        permanent: true,
      },
      {
        source: "/sunbul/clients/:clientId/records/:recordId",
        destination: "/workflowos/clients/:clientId/records/:recordId",
        permanent: true,
      },
      {
        source: "/products/office-ai",
        destination: "/products",
        permanent: true,
      },
    ]
  },

  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; ${cspScriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self';`,
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ]
  },

  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "pdfkit",
    "pdf-parse",
    "pdfjs-dist",
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
