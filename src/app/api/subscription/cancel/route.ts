import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import DodoPayments from "dodopayments";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function getDodoClient() {
  const apiKey = process.env.DODO_API_KEY;
  if (!apiKey) throw new Error("DODO_API_KEY is not configured.");
  const isTestMode = process.env.DODO_ENV === "test_mode" || process.env.NODE_ENV !== "production";
  return new DodoPayments({
    bearerToken: apiKey,
    environment: isTestMode ? "test_mode" : "live_mode",
  });
}

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
    .select("plan, status, current_period_end, provider_subscription_id, provider_customer_id")
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

  try {
    const dodo = getDodoClient();
    const admin = getServiceRoleClient();

    let subscriptionId = entitlement.provider_subscription_id as string | null;

    // Accounts created before provider_subscription_id was stored: look it up via customer.
    if (!subscriptionId && entitlement.provider_customer_id) {
      const page = await dodo.subscriptions.list({
        customer_id: entitlement.provider_customer_id as string,
        status: "active",
      });
      const found = page.items?.[0];
      if (found?.subscription_id) {
        subscriptionId = found.subscription_id;
        await admin
          .from("user_entitlements")
          .update({ provider_subscription_id: subscriptionId })
          .eq("user_id", user.id);
      }
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Could not find your subscription. Please contact support." },
        { status: 400 }
      );
    }

    await dodo.subscriptions.update(subscriptionId, {
      cancel_at_next_billing_date: true,
    });

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
