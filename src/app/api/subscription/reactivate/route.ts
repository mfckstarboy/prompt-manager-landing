import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { removePaddleScheduledCancellation } from "@/lib/paddle";
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

  const isCanceledWithinPeriod =
    entitlement.plan === "premium" &&
    entitlement.status === "canceled" &&
    entitlement.current_period_end !== null &&
    new Date(entitlement.current_period_end) > new Date();

  if (!isCanceledWithinPeriod) {
    return NextResponse.json(
      { error: "Subscription is not eligible for reactivation" },
      { status: 400 }
    );
  }

  if (!entitlement.provider_subscription_id) {
    return NextResponse.json({ error: "No subscription ID on record" }, { status: 400 });
  }

  try {
    await removePaddleScheduledCancellation(entitlement.provider_subscription_id);

    const admin = getServiceRoleClient();
    const { error: updateError } = await admin
      .from("user_entitlements")
      .update({ status: "active" })
      .eq("user_id", user.id);

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ reactivated: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reactivation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
