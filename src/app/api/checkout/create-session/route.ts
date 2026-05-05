import { NextRequest, NextResponse } from "next/server";

import { createPaddleCheckoutTransaction } from "@/lib/paddle";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

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

  const priceId =
    interval === "annual"
      ? process.env.PADDLE_ANNUAL_PRICE_ID
      : process.env.PADDLE_MONTHLY_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
  }

  const redirectUrl = `${getSiteUrl()}/upgrade/success`;

  try {
    const transaction = await createPaddleCheckoutTransaction({
      priceId,
      userId: user.id,
      plan: "premium",
      redirectUrl,
    });

    const checkoutUrl = transaction.checkout?.url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
