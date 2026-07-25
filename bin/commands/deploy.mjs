import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const REQUIRED_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXTAUTH_URL",
  "DOWNLOAD_TOKEN_SECRET",
];

export async function run() {
  const envPath = join(process.cwd(), ".env.staging");

  console.log("\n🔍 Validating .env.staging...\n");

  if (!existsSync(envPath)) {
    console.error("❌ .env.staging not found. Create it before deploying.");
    process.exitCode = 1;
    return;
  }

  const content = readFileSync(envPath, "utf8");
  const missing = [];

  for (const key of REQUIRED_VARS) {
    const regex = new RegExp(`^${key}=`, "m");
    if (!regex.test(content)) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Missing required env vars in .env.staging:\n   ${missing.join("\n   ")}`);
    process.exitCode = 1;
    return;
  }

  console.log("✅ All required env vars present.\n");

  console.log("📦 Running: npx prisma migrate deploy...\n");
  try {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      timeout: 120000,
      cwd: process.cwd(),
    });
    console.log("\n✅ Prisma migrations applied.\n");
  } catch (err) {
    console.error("\n❌ Prisma migrate deploy failed.");
    if (err.stderr) console.error(err.stderr.toString());
    process.exitCode = 1;
    return;
  }

  console.log("🏗️  Running: npm run build...\n");
  try {
    execSync("npm run build", {
      stdio: "inherit",
      timeout: 300000,
      cwd: process.cwd(),
    });
    console.log("\n✅ Build succeeded.\n");
  } catch (err) {
    console.error("\n❌ Build failed.");
    if (err.stderr) console.error(err.stderr.toString());
    process.exitCode = 1;
    return;
  }

  console.log("═══════════════════════════════════════════");
  console.log("  ✅ AQLIYA Staging deployment ready!");
  console.log("═══════════════════════════════════════════\n");
  console.log("Next steps:");
  console.log("  1. Verify the app: npm run start");
  console.log("  2. Run smoke tests: npm run smoke:local");
  console.log("  3. Monitor Sentry for errors");
  console.log("  4. Check health endpoint: /api/platform/health\n");
}
