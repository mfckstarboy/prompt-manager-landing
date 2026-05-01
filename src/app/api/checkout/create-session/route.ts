import DodoPayments from "dodopayments";
import { NextRequest, NextResponse } from "next/server";

import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

function getDodoClient() {
  const apiKey = process.env.DODO_API_KEY;

  if (!apiKey) {
    throw new Error("DODO_API_KEY is not configured.");
  }

  const isTestMode = process.env.DODO_ENV === "test_mode" || process.env.NODE_ENV !== "production";

  return new DodoPayments({
    bearerToken: apiKey,
    environment: isTestMode ? "test_mode" : "live_mode",
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let interval: string;
  try {
    const body = (await request.json()) as { interval?: string };
    interval = body.interval === "annual" ? "annual" : "monthly";
  } catch {
    interval = "monthly";
  }

  const productId =
    interval === "annual"
      ? process.env.DODO_ANNUAL_PRODUCT_ID
      : process.env.DODO_MONTHLY_PRODUCT_ID;

  if (!productId) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
  }

  const redirectUrl = `${getSiteUrl()}/upgrade/success`;

  try {
    const dodo = getDodoClient();

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      metadata: {
        userId: user.id,
        plan: "premium",
      },
      return_url: redirectUrl,
    });

    const checkoutUrl = session.checkout_url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
