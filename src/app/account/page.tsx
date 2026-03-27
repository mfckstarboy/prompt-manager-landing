import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Account | PromptTray",
  description: "PromptTray account overview.",
};

export default function AccountRoute() {
  redirect("/app");
}
