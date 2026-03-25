import type { Metadata } from "next";

import DashboardPage from "@/components/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Account | PromptTray",
  description: "PromptTray account overview.",
};

export default function AccountRoute() {
  return <DashboardPage />;
}
