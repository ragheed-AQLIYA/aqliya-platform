"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ContactSidebarActionsProps {
  contactId: string;
  userRole: string;
  handleDelete: (formData: FormData) => void;
}

export function ContactSidebarActions({ contactId, userRole, handleDelete }: ContactSidebarActionsProps) {
  if (userRole !== "ADMIN" && userRole !== "OPERATOR") return null;

  return (
    <>
      <Link href={`/contacts/${contactId}/edit`}>
        <Button variant="outline" className="w-full">
          <Edit className="ml-2 h-4 w-4" />
          تعديل
        </Button>
      </Link>
      <form action={handleDelete}>
        <Button type="submit" variant="destructive" className="w-full">
          <Trash2 className="ml-2 h-4 w-4" />
          حذف
        </Button>
      </form>
    </>
  );
}
