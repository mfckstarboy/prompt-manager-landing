import { NextRequest, NextResponse } from "next/server";

import { createDodoCheckoutUrl } from "@/lib/billing";
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

  const productId =
    interval === "annual"
      ? process.env.DODO_ANNUAL_PRODUCT_ID
      : process.env.DODO_MONTHLY_PRODUCT_ID;

  if (!productId) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
  }

  const redirectUrl = `${getSiteUrl()}/upgrade/success`;

  const url = createDodoCheckoutUrl({
    userId: user.id,
    productId,
    redirectUrl,
  });

  return NextResponse.json({ url });
}
