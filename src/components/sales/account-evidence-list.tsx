import type { SalesEvidenceLinkView } from "@/lib/sales/evidence-links";
import { FileText } from "lucide-react";

export function AccountEvidenceList({
  links,
  count,
}: {
  links: SalesEvidenceLinkView[];
  count: number;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {count === 0
          ? "لا أدلة مربوطة بهذا الحساب."
          : `${count} دليل مربوط — قراءة فقط في P1.`}
      </p>
      {links.length > 0 ? (
        <ul className="space-y-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-start gap-2 rounded-md border p-3 text-sm"
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">{link.title}</p>
                <p className="text-xs text-muted-foreground">
                  {link.evidenceId} · {link.type} · {link.evidenceSource}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
