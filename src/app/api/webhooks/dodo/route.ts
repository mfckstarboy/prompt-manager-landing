import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import DodoPayments from "dodopayments";
import { NextRequest, NextResponse } from "next/server";

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

async function upsertPremiumEntitlement(
  userId: string,
  customerId: string,
  periodEnd: string | null
) {
  const supabase = getServiceRoleClient();
  const { error } = await supabase.from("user_entitlements").upsert(
    {
      user_id: userId,
      plan: "premium",
      status: "active",
      provider: "dodo",
      current_period_end: periodEnd,
      dodo_customer_id: customerId,
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
}

async function downgradeToFree(userId: string) {
  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from("user_entitlements")
    .update({ plan: "free", status: "canceled" })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const dodo = new DodoPayments({
    bearerToken: process.env.DODO_API_KEY ?? "",
    webhookKey: webhookSecret,
  });

  let event: ReturnType<typeof dodo.webhooks.unsafeUnwrap>;
  try {
    event = dodo.webhooks.unwrap(rawBody, { headers, key: webhookSecret });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    if (event.type === "subscription.active" || event.type === "subscription.renewed") {
      const sub = event.data;
      const userId = sub.metadata?.userId;
      const customerId = sub.customer.customer_id;
      const periodEnd = sub.next_billing_date ?? null;

      if (userId) {
        await upsertPremiumEntitlement(userId, customerId, periodEnd);
      }
    } else if (event.type === "payment.succeeded") {
      const payment = event.data;
      const userId = payment.metadata?.userId;
      const customerId = payment.customer.customer_id;

      if (userId) {
        await upsertPremiumEntitlement(userId, customerId, null);
      }
    } else if (
      event.type === "subscription.cancelled" ||
      event.type === "subscription.expired"
    ) {
      const sub = event.data;
      const userId = sub.metadata?.userId;

      if (userId) {
        await downgradeToFree(userId);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
