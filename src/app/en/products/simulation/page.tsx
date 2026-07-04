import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "SimulationOS — AQLIYA",
};

export default function SimulationOSEnPage() {
  redirect("/en/products");
}
