import { createClient } from "@/lib/supabase/server";

import { PricingTeaserContent, type PlanInfo } from "./pricing-teaser-content";

async function getUserPlanInfo(): Promise<PlanInfo | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("user_entitlements")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return { plan: "free", status: "inactive", periodEnd: null };

  return {
    plan: data.plan as "free" | "premium",
    status: data.status as PlanInfo["status"],
    periodEnd: data.current_period_end ?? null,
  };
}

export async function PricingTeaser() {
  const planInfo = await getUserPlanInfo();
  return <PricingTeaserContent planInfo={planInfo} />;
}
