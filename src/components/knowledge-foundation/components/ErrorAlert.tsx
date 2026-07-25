"use client";

export function ErrorAlert({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      {error}
    </div>
  );
}
