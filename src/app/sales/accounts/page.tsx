import { redirect } from "next/navigation";

/** SalesOS prototype: list browse lives on dashboard until v0.1 list routes ship. */
export default function SalesAccountsListRedirect() {
  redirect("/sales");
}
