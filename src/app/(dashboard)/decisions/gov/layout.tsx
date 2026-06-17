import Link from "next/link";

export default function DecisionGovLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav
        className="mb-6 flex items-center gap-1 border-b pb-2"
        aria-label="التنقل الرئيسي"
      >
        <Link
          href="/decisions"
          className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          لوحة القرارات
        </Link>
        <Link
          href="/decisions/gov"
          className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          الحوكمة
        </Link>
      </nav>
      {children}
    </>
  );
}
