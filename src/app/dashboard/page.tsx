import type { Metadata } from "next";

import DashboardPage from "@/components/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard | PromptTray",
  description: "PromptTray account dashboard and extension sync overview.",
};

export default function DashboardRoute() {
  return <DashboardPage />;
}
