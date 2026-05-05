import { NextRequest, NextResponse } from "next/server";

import { createPaddlePortalUrl, type PaddlePortalIntent } from "@/lib/paddle-portal";
import { createClient } from "@/lib/supabase/server";

function parseIntent(value: unknown): PaddlePortalIntent {
  return value === "update-payment-method" ? "update-payment-method" : "manage";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { intent?: unknown };
  const intent = parseIntent(body.intent);

  const { data: entitlement, error } = await supabase
    .from("user_entitlements")
    .select("plan, status, provider_customer_id, provider_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!entitlement || entitlement.plan !== "premium" || !entitlement.provider_customer_id) {
    return NextResponse.json({ error: "No Paddle billing account found." }, { status: 404 });
  }

  if (!["active", "past_due", "canceled"].includes(entitlement.status)) {
    return NextResponse.json(
      { error: "Subscription is not eligible for billing management." },
      { status: 409 }
    );
  }

  try {
    const url = await createPaddlePortalUrl({
      customerId: entitlement.provider_customer_id,
      subscriptionId: entitlement.provider_subscription_id ?? null,
      intent,
    });

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to create Paddle portal link.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
