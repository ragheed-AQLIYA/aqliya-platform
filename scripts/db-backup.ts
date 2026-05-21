import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../.env") });

const backupDir = resolve(__dirname, "../backups");
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL is required for backup");
  process.exit(1);
}

if (!existsSync(backupDir)) {
  mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `aqliya_backup_${timestamp}.dump`;
const filepath = resolve(backupDir, filename);

function findPgDump(): string {
  const pgDumpPath = process.env.PGDUMP_PATH;
  if (pgDumpPath && existsSync(pgDumpPath)) return pgDumpPath;

  const candidates = [
    process.env.PGDUMP_PATH,
    "pg_dump",
    "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe",
    "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe",
    "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      execSync(`"${candidate}" --version`, { stdio: "pipe" });
      return candidate;
    } catch {
      /* try next */
    }
  }
  return "pg_dump";
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
    console.log(`Backup destination: ${filepath}`);
    process.exit(1);
  }

  const pgdump = findPgDump();
  const env = { ...process.env, PGPASSWORD: db.password };
  const cmd = `"${pgdump}" -U ${db.username} -h ${db.host} -p ${db.port} -d ${db.database} -F c -f "${filepath}"`;

  console.log(`Backing up ${db.host}:${db.port}/${db.database} → ${filename}`);
  execSync(cmd, { env, stdio: "inherit" });
  console.log(`Backup complete: ${filepath}`);
} catch (e) {
  const err = e as Error & { stderr?: Buffer };
  console.error("Backup failed:", err.message);
  if (err.stderr) console.error(err.stderr.toString());
  process.exit(1);
}
