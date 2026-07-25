"use client";

interface Props {
  parseErrors: string[];
  hasLines: boolean;
}

export function TbParseWarnings({ parseErrors, hasLines }: Props) {
  if (parseErrors.length === 0 || !hasLines) return null;

  return (
    <div className="p-2 rounded-lg text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20">
      <p className="font-medium mb-1">تحذيرات:</p>
      {parseErrors.map((err, i) => (
        <p key={i}>⚠ {err}</p>
      ))}
    </div>
  );
}
