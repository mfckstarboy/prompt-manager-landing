import { NextRequest, NextResponse } from "next/server";

import {
  getPaddleSubscriptionBillingInterval,
  switchPaddleSubscriptionToAnnual,
} from "@/lib/paddle";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { interval?: unknown };
  const targetInterval = body.interval === "annual" ? "annual" : null;

  if (targetInterval !== "annual") {
    return NextResponse.json({ error: "Only annual upgrades are supported." }, { status: 400 });
  }

  const { data: entitlement, error } = await supabase
    .from("user_entitlements")
    .select("plan, status, provider_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (
    !entitlement ||
    entitlement.plan !== "premium" ||
    entitlement.status !== "active" ||
    !entitlement.provider_subscription_id
  ) {
    return NextResponse.json({ error: "Subscription is not eligible for upgrade." }, { status: 409 });
  }

  try {
    const currentInterval = await getPaddleSubscriptionBillingInterval(
      entitlement.provider_subscription_id
    );

    if (currentInterval === "annual") {
      return NextResponse.json({ error: "Annual is already your current plan." }, { status: 409 });
    }

    await switchPaddleSubscriptionToAnnual(entitlement.provider_subscription_id);
    return NextResponse.json({ changed: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to update subscription.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
