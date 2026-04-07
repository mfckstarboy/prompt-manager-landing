import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "PromptTray account dashboard and extension sync overview.",
};

export default function DashboardRoute() {
  permanentRedirect("/app");
}
