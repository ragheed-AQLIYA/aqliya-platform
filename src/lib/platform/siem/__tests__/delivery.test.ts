import { deliverToFile } from "../delivery";
import { readFile, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("deliverToFile", () => {
  const tmpDir = join(tmpdir(), "siem-test-delivery");
  const testData = JSON.stringify({ test: "data", timestamp: Date.now() });
  let filePath: string;

  beforeAll(async () => {
    await mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    if (filePath) {
      await unlink(filePath).catch(() => {});
    }
  });

  it("writes data to file", async () => {
    filePath = join(tmpDir, `test-${Date.now()}.json`);
    const result = await deliverToFile(testData, filePath);
    expect(result.ok).toBe(true);
    const content = await readFile(filePath, "utf-8");
    expect(content).toBe(testData);
  });

  it("returns ok: false on invalid path", async () => {
    const result = await deliverToFile(testData, "Z:\\invalid\\path\\file.json");
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });
});
