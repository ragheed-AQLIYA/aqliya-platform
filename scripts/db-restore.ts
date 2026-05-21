import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../.env") });

const file = process.argv[2];
const confirmRestore = process.env.CONFIRM_RESTORE === "true";

if (!file) {
  console.error("Usage: npm run db:restore -- <backup-file>");
  console.error("Set CONFIRM_RESTORE=true to execute the restore.");
  process.exit(1);
}

if (!existsSync(file)) {
  console.error(`Backup file not found: ${file}`);
  process.exit(1);
}

if (!confirmRestore) {
  console.log("DRY RUN — set CONFIRM_RESTORE=true to execute.");
  console.log(`Would restore: ${file}`);
  console.log(
    `From DATABASE_URL: ${process.env.DATABASE_URL ? "(set)" : "(missing)"}`,
  );
  process.exit(0);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is required for restore");
  process.exit(1);
}

function parseDbUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
      host: parsed.hostname,
      port: parsed.port || "5432",
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
    };
  } catch {
    return null;
  }
}

try {
  const db = parseDbUrl(dbUrl);
  if (!db) {
    console.error("Failed to parse DATABASE_URL");
    process.exit(1);
  }

  const env = { ...process.env, PGPASSWORD: db.password };
  const cmd = `pg_restore -U ${db.username} -h ${db.host} -p ${db.port} -d ${db.database} --clean "${file}"`;

  console.log(`Restoring ${db.host}:${db.port}/${db.database} from: ${file}`);
  execSync(cmd, { env, stdio: "inherit" });
  console.log("Restore complete.");
} catch (e) {
  const err = e as Error;
  console.error("Restore failed:", err.message);
  process.exit(1);
}
