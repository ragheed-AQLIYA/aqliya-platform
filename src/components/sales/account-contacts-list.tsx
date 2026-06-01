import type { SalesContactView } from "@/lib/sales/contacts";
import { Mail, User } from "lucide-react";

export function AccountContactsList({
  contacts,
}: {
  contacts: SalesContactView[];
}) {
  if (contacts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">لا جهات اتصال مسجّلة لهذا الحساب</p>
    );
  }

  return (
    <ul className="space-y-3">
      {contacts.map((contact) => (
        <li
          key={contact.id}
          className="rounded-md border border-border/60 px-3 py-2"
        >
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">{contact.name}</p>
              {contact.role ? (
                <p className="text-xs text-muted-foreground">{contact.role}</p>
              ) : null}
              {contact.email ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span dir="ltr" className="truncate">
                    {contact.email}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
