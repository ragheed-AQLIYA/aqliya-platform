"use client";

import { cn } from "@/lib/utils";

export function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {num}
      </span>
      <h2 className="text-base font-black">{label}</h2>
    </div>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  required,
  id,
  error,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  required?: boolean;
  id: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? " *" : ""}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.value === ""}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function CardSelect({
  items,
  selected,
  onChange,
}: {
  items: { id: string; label: string; desc: string }[];
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role="radiogroup"
      aria-label="نوع النظام"
    >
      {items.map((item) => {
        const active = selected === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(active ? "" : item.id)}
            className={cn(
              "rounded-2xl border border-border/70 p-4 text-right transition-all sm:p-5",
              active
                ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                : "bg-background hover:border-muted-foreground/20 hover:bg-muted/30",
            )}
            aria-pressed={active}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "text-sm font-semibold",
                  active && "text-primary",
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2",
                  active
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30",
                )}
              />
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {item.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function CheckboxGroup({
  items,
  selected,
  onChange,
  label,
}: {
  items: { id: string; label: string }[];
  selected: string[];
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {items.map((item) => {
          const active = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id);
              }}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm transition-colors",
                active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/70 bg-background text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
              )}
              aria-pressed={active}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  error,
  dir,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  error?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="w-full rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
