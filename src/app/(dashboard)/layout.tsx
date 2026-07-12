import { DashboardShell } from "@/components/platform/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await getCurrentUser();
  } catch {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
