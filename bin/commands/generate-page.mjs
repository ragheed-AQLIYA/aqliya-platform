import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

function toPascalFromKebab(str) {
  return str
    .split(/[/-]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function toCamelFromKebab(str) {
  const pascal = toPascalFromKebab(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export async function run(args) {
  if (args.length === 0) {
    console.error("Usage: aqliya generate:page <path>");
    console.error("Example: aqliya generate:page settings/integrations");
    process.exitCode = 1;
    return;
  }

  const pagePath = args[0].replace(/^\//, "").replace(/\/$/, "");
  const segments = pagePath.split("/");
  const lastSeg = segments[segments.length - 1];
  const namePascal = toPascalFromKebab(lastSeg);
  const nameCamel = toCamelFromKebab(lastSeg);

  const baseDir = join(process.cwd(), "src", "app", "(dashboard)", pagePath);
  const componentsDir = join(baseDir, "components");

  for (const dir of [baseDir, componentsDir]) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  const files = {
    "page.tsx": `"use client";

import { use${namePascal} } from "./components/use-${nameCamel}";
import { ${namePascal}Header } from "./components/${nameCamel}-header";
import { ${namePascal}List } from "./components/${nameCamel}-list";

export default function ${namePascal}Page() {
  const { items, loading, error, refresh } = use${namePascal}();

  if (loading) return <div className="p-8 text-muted-foreground">جاري التحميل...</div>;

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive">
          <p>{error}</p>
          <button onClick={refresh} className="underline mt-2 inline-block">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <${namePascal}Header />
      {items.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          لا توجد عناصر بعد
        </div>
      ) : (
        <${namePascal}List items={items} />
      )}
    </div>
  );
}
`,

    [`use-${nameCamel}.ts`]: `"use client";

import { useState, useEffect, useCallback } from "react";

export interface ${namePascal}Item {
  id: string;
  title: string;
}

export interface ${namePascal}Return {
  items: ${namePascal}Item[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function use${namePascal}(): ${namePascal}Return {
  const [items, setItems] = useState<${namePascal}Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: replace with actual data fetch
      // const data = await list${namePascal}Action();
      // setItems(data);
      setItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل التحميل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}
`,

    [`${nameCamel}-header.tsx`]: `"use client";

interface ${namePascal}HeaderProps {
  title?: string;
}

export function ${namePascal}Header({ title }: ${namePascal}HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title || "${namePascal}"}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          إدارة وعرض العناصر
        </p>
      </div>
    </div>
  );
}
`,

    [`${nameCamel}-list.tsx`]: `"use client";

import type { ${namePascal}Item } from "../components/use-${nameCamel}";

interface ${namePascal}ListProps {
  items: ${namePascal}Item[];
}

export function ${namePascal}List({ items }: ${namePascal}ListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        لا توجد عناصر
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <p className="font-medium">{item.title}</p>
        </div>
      ))}
    </div>
  );
}
`,
  };

  for (const [filename, content] of Object.entries(files)) {
    const targetDir = filename.startsWith("use-") || filename.endsWith("-header.tsx") || filename.endsWith("-list.tsx")
      ? componentsDir
      : baseDir;
    const filePath = join(targetDir, filename);

    if (existsSync(filePath)) {
      console.warn(`⚠ Skipping existing file: ${filePath}`);
      continue;
    }

    writeFileSync(filePath, content, "utf8");
    console.log(`✅ Created: ${filePath}`);
  }

  console.log(`\n📋 Page "${pagePath}" generated successfully.
   - ${baseDir}\\page.tsx
   - ${componentsDir}\\use-${nameCamel}.ts
   - ${componentsDir}\\${nameCamel}-header.tsx
   - ${componentsDir}\\${nameCamel}-list.tsx

Next steps:
   1. Replace the TODO in use-${nameCamel}.ts with a real Server Action import
   2. Add your actual UI components
`);
}
