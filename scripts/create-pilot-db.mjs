import { Client } from "pg";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const adminUrl = url.replace(/\/[^/?]+(\?|$)/, "/postgres$1");
const client = new Client({ connectionString: adminUrl });

try {
  await client.connect();
  const check = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    ["aqliya_pilot"],
  );
  if (check.rowCount === 0) {
    await client.query("CREATE DATABASE aqliya_pilot");
    console.log("CREATED aqliya_pilot");
  } else {
    console.log("EXISTS aqliya_pilot");
  }
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
