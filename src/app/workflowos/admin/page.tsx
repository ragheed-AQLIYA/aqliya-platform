import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WorkflowAdminPage } from "@/components/workflowos/workflow-admin-page";

export default async function WorkflowosAdminPage() {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/access-denied");
  }

  return <WorkflowAdminPage />;
}
