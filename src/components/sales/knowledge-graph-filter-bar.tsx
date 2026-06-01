"use client";

import { usePathname, useRouter } from "next/navigation";

export type KnowledgeGraphFilterOptions = {
  accounts: { id: string; label: string }[];
  industries: string[];
  account?: string;
  industry?: string;
};

export function KnowledgeGraphFilterBar({
  options,
}: {
  options: KnowledgeGraphFilterOptions;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(next: { account?: string; industry?: string }) {
    const params = new URLSearchParams(window.location.search);
    params.delete("account");
    params.delete("industry");
    if (next.account) params.set("account", next.account);
    if (next.industry) params.set("industry", next.industry);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}#graph`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
      <label className="flex min-w-[10rem] flex-col gap-1 text-xs">
        <span className="font-medium text-muted-foreground">تصفية بحساب</span>
        <select
          className="rounded-md border bg-background px-2 py-1.5 text-sm"
          value={options.account ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            navigate({ account: value || undefined });
          }}
        >
          <option value="">كل الحسابات</option>
          {options.accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[10rem] flex-col gap-1 text-xs">
        <span className="font-medium text-muted-foreground">تصفية بقطاع</span>
        <select
          className="rounded-md border bg-background px-2 py-1.5 text-sm"
          value={options.industry ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            navigate({ industry: value || undefined });
          }}
          disabled={Boolean(options.account)}
        >
          <option value="">كل القطاعات</option>
          {options.industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </label>

      {(options.account || options.industry) && (
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
          onClick={() => navigate({})}
        >
          إزالة التصفية
        </button>
      )}
    </div>
  );
}
