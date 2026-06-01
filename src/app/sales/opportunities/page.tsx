import { redirect } from "next/navigation";

/** SalesOS prototype: opportunity browse lives on command center until v0.1 list routes ship. */
export default function SalesOpportunitiesListRedirect() {
  redirect("/sales/command-center#opportunities");
}
