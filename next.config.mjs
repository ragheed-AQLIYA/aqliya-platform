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
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/executive-briefing",
        destination: "/proof#executive-brief",
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
        source: "/products/simulation",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/solutions",
        destination: "/products",
        permanent: false,
      },
      {
        source: "/buyers/procurement",
        destination: "/procurement-pack",
        permanent: true,
      },
      {
        source: "/decision",
        destination: "/decisions",
        permanent: true,
      },
      {
        source: "/decision/gov",
        destination: "/decisions/gov",
        permanent: true,
      },
      {
        source: "/decision/gov/:path*",
        destination: "/decisions/gov/:path*",
        permanent: true,
      },
      {
        source: "/how-we-work",
        destination: "/start",
        permanent: false,
      },
      {
        source: "/executive-brief",
        destination: "/proof#executive-brief",
        permanent: true,
      },
      {
        source: "/pilot-proof",
        destination: "/proof#evaluation-framework",
        permanent: true,
      },
      {
        source: "/proof-library",
        destination: "/proof#evidence-samples",
        permanent: true,
      },
      {
        source: "/pilot-outcomes",
        destination: "/proof#outcomes",
        permanent: true,
      },
      {
        source: "/en/executive-brief",
        destination: "/en/proof#executive-brief",
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
            value:
              "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.sentry.io; worker-src 'none'; manifest-src 'self';",
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
