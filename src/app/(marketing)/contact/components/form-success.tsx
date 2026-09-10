"use client";

type Props = {
  successTitle: string;
  successBody: string;
};

export function FormSuccess({ successTitle, successBody }: Props) {
  return (
    <div className="mt-8 text-center py-12">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-aqliya-cyan/10">
        <span className="text-3xl text-aqliya-cyan">✓</span>
      </div>
      <p className="text-xl font-bold text-white">{successTitle}</p>
      <p className="mt-2 text-sm text-white/62">{successBody}</p>
    </div>
  );
}
