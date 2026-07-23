import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import InstitutionalMemoryClientLayout from "./layout-client";

export default async function InstitutionalMemoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <InstitutionalMemoryClientLayout>
      {children}
    </InstitutionalMemoryClientLayout>
  );
}
