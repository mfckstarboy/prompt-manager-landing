export type PlanInfo = {
  billingInterval?: "monthly" | "annual" | null;
  plan: "free" | "premium";
  status: "active" | "inactive" | "past_due" | "canceled" | "expired";
  periodEnd: string | null;
};

export function isPremiumActive(info: PlanInfo): boolean {
  return (
    info.plan === "premium" &&
    (info.status === "active" || info.status === "past_due") &&
    (!info.periodEnd || new Date(info.periodEnd) > new Date())
  );
}

export function isPremiumCanceled(info: PlanInfo): boolean {
  return (
    info.plan === "premium" &&
    info.status === "canceled" &&
    info.periodEnd !== null &&
    new Date(info.periodEnd) > new Date()
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
