import * as fs from "fs";
import * as path from "path";
import type {
  StorageProvider,
  StorageFile,
  StorageProviderType,
} from "./types";

const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "uploads");

const TRAVERSAL_PATTERN = /[/\\]\.\.[/\\]|\.\.[/\\]|[/\\]\.\.$/;

export class LocalStorageProvider implements StorageProvider {
  readonly type: StorageProviderType = "local";
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? DEFAULT_UPLOAD_DIR;
    this.ensureDir(this.baseDir);
  }

  async store(
    key: string,
    file: { filename: string; mimeType: string; content: Buffer },
  ): Promise<string> {
    const filePath = this.resolvePath(key);
    const dir = path.dirname(filePath);
    this.ensureDir(dir);
    await fs.promises.writeFile(filePath, file.content);
    return key;
  }

  async retrieve(key: string): Promise<StorageFile | null> {
    const filePath = this.resolvePath(key);
    try {
      const stat = await fs.promises.stat(filePath);
      const content = await fs.promises.readFile(filePath);
      const filename = path.basename(key);
      const ext = path.extname(filename).toLowerCase();
      return {
        key,
        filename,
        mimeType: mimeFromExt(ext),
        sizeBytes: stat.size,
        content,
      };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    const filePath = this.resolvePath(key);
    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.resolvePath(key);
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  private resolvePath(key: string): string {
    if (TRAVERSAL_PATTERN.test(key)) {
      throw new Error("Path traversal detected in storage key");
    }
    const normalized = key.replace(/^[/\\]+/, "").replace(/[/\\]+/g, path.sep);
    const joined = path.join(this.baseDir, normalized);
    const resolved = path.resolve(joined);
    const baseResolved = path.resolve(this.baseDir);
    if (!resolved.startsWith(baseResolved)) {
      throw new Error(
        "Path traversal detected: storage key escapes base directory",
      );
    }
    return resolved;
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".csv": "text/csv",
  };
  return map[ext] ?? "application/octet-stream";
}

export function getLocalStoreBaseDir(): string {
  const envDir = process.env.LOCAL_STORAGE_DIR;
  return envDir ? path.resolve(envDir) : DEFAULT_UPLOAD_DIR;
}
