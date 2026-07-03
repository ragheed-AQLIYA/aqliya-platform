/**
 * Runtime wrapper health tests.
 *
 * Verifies that .mjs runtime entrypoints resolve to real .ts files,
 * preventing silent drift when the underlying TypeScript implementation
 * is moved or renamed.
 */
import * as fs from "node:fs";
import * as path from "node:path";

describe("runtime wrapper health", () => {
  const wrapperDir = path.resolve(__dirname, "../../../scripts/platform");

  function findScriptPath(wrapperPath: string): string {
    const src = fs.readFileSync(wrapperPath, "utf8");
    const match = src.match(/scriptPath\s*=\s*resolve\([^)]+,\s*"([^"]+)"\)/);
    if (!match?.[1]) {
      throw new Error(
        `Could not extract scriptPath from ${path.basename(wrapperPath)}`,
      );
    }
    return path.resolve(path.dirname(wrapperPath), match[1]);
  }

  it("db-backup-scheduler.mjs resolves to an existing .ts file", () => {
    const resolved = findScriptPath(
      path.join(wrapperDir, "db-backup-scheduler.mjs"),
    );
    expect(fs.existsSync(resolved)).toBe(true);
    expect(resolved).toMatch(/db-backup-scheduler\.ts$/);
  });

  it("audit-archival-cron.mjs resolves to an existing .ts file", () => {
    const resolved = findScriptPath(
      path.join(wrapperDir, "audit-archival-cron.mjs"),
    );
    expect(fs.existsSync(resolved)).toBe(true);
    expect(resolved).toMatch(/run\.ts$/);
  });

  it("archival wrapper includes dotenv/config for env loading", () => {
    const src = fs.readFileSync(
      path.join(wrapperDir, "audit-archival-cron.mjs"),
      "utf8",
    );
    expect(src).toContain('"--import", "dotenv/config"');
    expect(src).toContain('"--import", "tsx"');
    expect(src).toContain("DOTENV_CONFIG_PATH");
  });

  it("backup scheduler wrapper includes tsx loader", () => {
    const src = fs.readFileSync(
      path.join(wrapperDir, "db-backup-scheduler.mjs"),
      "utf8",
    );
    expect(src).toContain('"--import", "tsx"');
    // No dotenv required — run.ts calls dotenv.config() internally via config()
  });

  it("neither wrapper has a direct import of .ts files (must go through tsx)", () => {
    for (const name of ["db-backup-scheduler.mjs", "audit-archival-cron.mjs"]) {
      const src = fs.readFileSync(path.join(wrapperDir, name), "utf8");

      // Should NOT contain direct import of .ts files
      const tsImports = src.match(/import\s+.*['"]\.\.?\/.*\.ts['"]/g);
      expect(tsImports).toBeNull();
    }
  });
});
