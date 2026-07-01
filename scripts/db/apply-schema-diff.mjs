-- Extract SQL commands from the diff and execute them
-- This runs the DROP INDEX, ALTER TABLE, CREATE TABLE statements

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";

const adapter = new PrismaPg("postgresql://postgres:postgres@localhost:5432/aqliya?schema=public");
const prisma = new PrismaClient({ adapter });

// Read the diff file
const diffContent = readFileSync(
  "C:\\Users\\PC\\.local\\share\\opencode\\tool-output\\tool_f0e3f9672001nC4HZCX8EItO5W",
  "utf-8"
);

// Skip the first line (status message)
const lines = diffContent.split("\n").slice(2).join("\n");

// Split into individual SQL statements
// Each statement ends with a semicolon
const statements = [];
let currentStmt = "";
for (const line of lines.split("\n")) {
  if (line.startsWith("--")) {
    if (currentStmt.trim()) {
      statements.push(currentStmt.trim());
    }
    currentStmt = "";
    continue;
  }
  currentStmt += line + "\n";
}
if (currentStmt.trim()) {
  statements.push(currentStmt.trim());
}

console.log(`Found ${statements.length} SQL statements to execute`);

let success = 0;
let failed = 0;

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  if (!stmt) continue;
  
  // Only run DROP INDEX, ALTER TABLE, CREATE TABLE, and ADD FOREIGN KEY
  if (!/^(DROP|ALTER|CREATE|--)/i.test(stmt.trim())) continue;
  
  try {
    await prisma.$executeRawUnsafe(stmt);
    success++;
    if (success <= 5 || i % 20 === 0) {
      console.log(`✅ [${i+1}] ${stmt.substring(0, 80)}...`);
    }
  } catch (err) {
    failed++;
    if (failed <= 5) {
      console.log(`⚠️  [${i+1}] ${stmt.substring(0, 80)}...`);
      console.log(`   Error: ${err.message.substring(0, 100)}`);
    }
  }
}

console.log(`\nDone: ${success} succeeded, ${failed} failed`);
await prisma.$disconnect();
