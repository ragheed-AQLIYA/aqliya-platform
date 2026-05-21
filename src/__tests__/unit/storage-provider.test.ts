import { LocalStorageProvider } from "@/lib/audit/storage/local-storage-provider";
import { buildStorageKey, parseStorageKey } from "@/lib/audit/storage";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const TEST_DIR = path.join(os.tmpdir(), "aqliya-storage-test-" + Date.now());

function makeProvider() {
  return new LocalStorageProvider(TEST_DIR);
}

beforeEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

afterAll(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe("LocalStorageProvider", () => {
  it("stores and retrieves a file", async () => {
    const provider = makeProvider();
    const key = buildStorageKey("eng-1", "ev-1", "test.pdf");
    const content = Buffer.from("hello world", "utf-8");
    const storedKey = await provider.store(key, {
      filename: "test.pdf",
      mimeType: "application/pdf",
      content,
    });
    expect(storedKey).toBe(key);
    const file = await provider.retrieve(key);
    expect(file).not.toBeNull();
    expect(file!.filename).toBe("test.pdf");
    expect(file!.mimeType).toBe("application/pdf");
    expect(file!.sizeBytes).toBe(11);
    expect(file!.content.toString()).toBe("hello world");
  });

  it("returns null for non-existent file", async () => {
    const provider = makeProvider();
    const file = await provider.retrieve("non/existent/file.pdf");
    expect(file).toBeNull();
  });

  it("checks file existence", async () => {
    const provider = makeProvider();
    const key = buildStorageKey("eng-1", "ev-2", "exists.pdf");
    expect(await provider.exists(key)).toBe(false);
    await provider.store(key, {
      filename: "exists.pdf",
      mimeType: "text/plain",
      content: Buffer.from("data"),
    });
    expect(await provider.exists(key)).toBe(true);
  });

  it("deletes a file", async () => {
    const provider = makeProvider();
    const key = buildStorageKey("eng-1", "ev-3", "delete.pdf");
    await provider.store(key, {
      filename: "delete.pdf",
      mimeType: "text/plain",
      content: Buffer.from("data"),
    });
    expect(await provider.exists(key)).toBe(true);
    const deleted = await provider.delete(key);
    expect(deleted).toBe(true);
    expect(await provider.exists(key)).toBe(false);
  });

  it("returns false when deleting non-existent file", async () => {
    const provider = makeProvider();
    const deleted = await provider.delete("no-such-key");
    expect(deleted).toBe(false);
  });

  it("creates nested directories automatically", async () => {
    const provider = makeProvider();
    const key = "deeply/nested/path/file.txt";
    await provider.store(key, {
      filename: "file.txt",
      mimeType: "text/plain",
      content: Buffer.from("nested"),
    });
    const file = await provider.retrieve(key);
    expect(file).not.toBeNull();
    expect(file!.content.toString()).toBe("nested");
  });

  it("correctly identifies mime types from extensions", async () => {
    const provider = makeProvider();
    const tests: Array<{ ext: string; mime: string }> = [
      { ext: "pdf", mime: "application/pdf" },
      {
        ext: "xlsx",
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      { ext: "jpg", mime: "image/jpeg" },
      { ext: "png", mime: "image/png" },
      { ext: "csv", mime: "text/csv" },
      { ext: "unknown", mime: "application/octet-stream" },
    ];
    for (const t of tests) {
      const key = buildStorageKey("eng-1", "ev-x", `file.${t.ext}`);
      await provider.store(key, {
        filename: `file.${t.ext}`,
        mimeType: t.ext,
        content: Buffer.from("x"),
      });
      const file = await provider.retrieve(key);
      expect(file!.mimeType).toBe(t.mime);
    }
  });
});

describe("buildStorageKey", () => {
  it("builds correct key from components", () => {
    const key = buildStorageKey("eng-001", "ev-abc", "report.pdf");
    expect(key).toBe("engagements/eng-001/evidence/ev-abc/report.pdf");
  });
});

describe("parseStorageKey", () => {
  it("parses a valid key", () => {
    const result = parseStorageKey(
      "engagements/eng-001/evidence/ev-abc/report.pdf",
    );
    expect(result).toEqual({
      engagementId: "eng-001",
      evidenceId: "ev-abc",
      filename: "report.pdf",
    });
  });

  it("returns null for invalid key", () => {
    expect(parseStorageKey("invalid/path")).toBeNull();
    expect(parseStorageKey("")).toBeNull();
  });

  it("handles filenames with subdirectories", () => {
    const result = parseStorageKey(
      "engagements/e1/evidence/e2/subdir/file.txt",
    );
    expect(result).toEqual({
      engagementId: "e1",
      evidenceId: "e2",
      filename: "subdir/file.txt",
    });
  });
});
