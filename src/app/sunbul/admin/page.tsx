import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SunbulAdminPage } from "@/components/sunbul/sunbul-admin-page";

export default async function AdminPage() {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/access-denied");
  }

  return <SunbulAdminPage />;
}
