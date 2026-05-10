export type BillingInterval = "monthly" | "annual";

export type PremiumCtaAction =
  | { action: "current"; label: "Current plan" }
  | { action: "upgrade"; label: "Upgrade plan" }
  | { action: "reactivate"; label: "Reactivate subscription" }
  | { action: "checkout"; label: "Upgrade to Premium" }
  | { action: "signup"; label: "Sign up & upgrade" };

export function getPremiumCtaState(params: {
  isAuthenticated: boolean;
  premiumActive: boolean;
  premiumCanceled: boolean;
  currentInterval: BillingInterval | null;
  selectedInterval: BillingInterval;
}): PremiumCtaAction {
  if (!params.isAuthenticated) return { action: "signup", label: "Sign up & upgrade" };
  if (params.premiumCanceled) return { action: "reactivate", label: "Reactivate subscription" };

  if (params.premiumActive) {
    if (params.currentInterval === params.selectedInterval) {
      return { action: "current", label: "Current plan" };
    }

    if (params.currentInterval === "monthly" && params.selectedInterval === "annual") {
      return { action: "upgrade", label: "Upgrade plan" };
    }

    return { action: "current", label: "Current plan" };
  }

  return { action: "checkout", label: "Upgrade to Premium" };
}
