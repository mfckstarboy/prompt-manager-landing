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

async function upsertPremiumEntitlement(params: {
  userId: string;
  customerId: string;
  subscriptionId: string | null;
  periodEnd: string | null;
}) {
  const supabase = getServiceRoleClient();
  const { error } = await supabase.from("user_entitlements").upsert(
    {
      user_id: params.userId,
      plan: "premium",
      status: "active",
      provider: "dodo",
      current_period_end: params.periodEnd,
      provider_customer_id: params.customerId,
      provider_subscription_id: params.subscriptionId,
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
}

// User cancelled — keep plan as "premium" so they retain access until current_period_end.
async function scheduledCancellation(params: {
  userId: string;
  periodEnd: string | null;
}) {
  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from("user_entitlements")
    .update({ status: "canceled", current_period_end: params.periodEnd })
    .eq("user_id", params.userId);

  if (error) throw new Error(error.message);
}

// Billing period ended — remove premium access now.
async function expireToFree(userId: string) {
  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from("user_entitlements")
    .update({ plan: "free", status: "expired" })
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
      const subscriptionId = sub.subscription_id;
      const periodEnd = sub.next_billing_date ?? null;

      if (userId) {
        await upsertPremiumEntitlement({ userId, customerId, subscriptionId, periodEnd });
      }
    } else if (event.type === "payment.succeeded") {
      const payment = event.data;
      const userId = payment.metadata?.userId;
      const customerId = payment.customer.customer_id;

      if (userId) {
        await upsertPremiumEntitlement({ userId, customerId, subscriptionId: null, periodEnd: null });
      }
    } else if (event.type === "subscription.cancelled") {
      // User cancelled — keep premium access until current_period_end.
      const sub = event.data;
      const userId = sub.metadata?.userId;
      const periodEnd = sub.next_billing_date ?? null;

      if (userId) {
        await scheduledCancellation({ userId, periodEnd });
      }
    } else if (event.type === "subscription.expired") {
      // Billing period ended — actually remove premium access.
      const sub = event.data;
      const userId = sub.metadata?.userId;

      if (userId) {
        await expireToFree(userId);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
