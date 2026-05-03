import { createClient } from "@/lib/supabase/server";

import { PricingTeaserContent } from "./pricing-teaser-content";

type EntitlementRow = {
  current_period_end: string | null;
  plan: string;
  status: string;
};

async function getUserPlan(): Promise<"free" | "premium" | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: entitlement } = await supabase
    .from("user_entitlements")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const row = entitlement as EntitlementRow | null;
  const isPremium =
    row?.plan === "premium" &&
    row?.status === "active" &&
    (!row.current_period_end || new Date(row.current_period_end) > new Date());

  return isPremium ? "premium" : "free";
}

export async function PricingTeaser() {
  const userPlan = await getUserPlan();
  return <PricingTeaserContent userPlan={userPlan} />;
}
