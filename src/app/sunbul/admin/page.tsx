import { permanentRedirect } from "next/navigation";

export default async function SunbulAdminPage() {
  permanentRedirect("/workflowos/admin");
}
