"use client";

export function LoadingState() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
