import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type EntitlementStatus = "active" | "inactive" | "past_due" | "canceled" | "expired";

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase service role configuration.");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function upsertPremiumEntitlement(params: {
  userId: string;
  status?: Extract<EntitlementStatus, "active" | "past_due" | "canceled">;
  provider: "paddle";
  customerId: string;
  subscriptionId: string;
  periodEnd: string | null;
}) {
  const supabase = getServiceRoleClient();
  const { error } = await supabase.from("user_entitlements").upsert(
    {
      user_id: params.userId,
      plan: "premium",
      status: params.status ?? "active",
      provider: params.provider,
      current_period_end: params.periodEnd,
      provider_customer_id: params.customerId,
      provider_subscription_id: params.subscriptionId,
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
}

export async function markEntitlementCanceled(params: {
  userId: string;
  periodEnd: string | null;
}) {
  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from("user_entitlements")
    .update({
      plan: "premium",
      status: "canceled",
      current_period_end: params.periodEnd,
    })
    .eq("user_id", params.userId);

  if (error) throw new Error(error.message);
}

export async function expireEntitlementToFree(userId: string) {
  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from("user_entitlements")
    .update({ plan: "free", status: "expired" })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
