import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { verifyDodoWebhookSignature } from "@/lib/billing";

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
  const signature = request.headers.get("webhook-signature") ?? "";

  let isValid: boolean;
  try {
    isValid = verifyDodoWebhookSignature({
      rawBody,
      signature,
      secret: webhookSecret,
    });
  } catch {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody) as { type: string; data: Record<string, unknown> };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data } = event;
  const userId = (data?.metadata as Record<string, string> | undefined)?.userId;
  const customerId = (data?.customer_id ?? data?.customerId ?? "") as string;
  const periodEnd = (data?.current_period_end ?? data?.next_billing_date ?? null) as string | null;

  try {
    if (type === "subscription.active" || type === "payment.succeeded") {
      if (userId) {
        await upsertPremiumEntitlement(userId, customerId, periodEnd);
      }
    } else if (type === "subscription.cancelled" || type === "subscription.expired") {
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
