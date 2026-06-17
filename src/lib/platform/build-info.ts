export const buildInfo = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
  buildTime: process.env.BUILD_TIME || new Date().toISOString(),
  commitHash: process.env.NEXT_PUBLIC_COMMIT_HASH || "development",
  nodeEnv: process.env.NODE_ENV || "development",
  platform: "AQLIYA",
  description: "Private Governed Institutional Intelligence Platform",
};
