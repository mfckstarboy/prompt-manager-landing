import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { cancelPaddleSubscription } from "@/lib/paddle";
import { createClient } from "@/lib/supabase/server";

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Missing Supabase service role configuration.");
  return createSupabaseAdmin(url, serviceRoleKey, { auth: { persistSession: false } });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: entitlement } = await supabase
    .from("user_entitlements")
    .select("plan, status, current_period_end, provider_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!entitlement) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const isActivePremium =
    entitlement.plan === "premium" &&
    (entitlement.status === "active" || entitlement.status === "past_due");

  if (!isActivePremium) {
    return NextResponse.json(
      { error: "Subscription is not eligible for cancellation" },
      { status: 400 }
    );
  }

  if (!entitlement.provider_subscription_id) {
    return NextResponse.json(
      { error: "Could not find your subscription. Please contact support." },
      { status: 400 }
    );
  }

  try {
    const admin = getServiceRoleClient();

    await cancelPaddleSubscription(entitlement.provider_subscription_id);

    const { error: updateError } = await admin
      .from("user_entitlements")
      .update({ status: "canceled" })
      .eq("user_id", user.id);

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ canceled: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cancellation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
