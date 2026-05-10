import { EventName, type SubscriptionNotification, type TransactionNotification } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";

import {
  expireEntitlementToFree,
  markEntitlementCanceled,
  upsertPremiumEntitlement,
} from "@/lib/entitlements";
import { unmarshalPaddleWebhook } from "@/lib/paddle";

function getCustomDataString(
  customData: SubscriptionNotification["customData"] | TransactionNotification["customData"],
  key: string
) {
  const value = customData?.[key];
  return typeof value === "string" ? value : null;
}

function getSubscriptionPeriodEnd(subscription: SubscriptionNotification) {
  return (
    subscription.scheduledChange?.effectiveAt ??
    subscription.currentBillingPeriod?.endsAt ??
    null
  );
}

async function handleSubscriptionEvent(
  eventType: string,
  subscription: SubscriptionNotification
) {
  const userId = getCustomDataString(subscription.customData, "userId");
  if (!userId) return;

  if (eventType === EventName.SubscriptionCanceled || subscription.status === "canceled") {
    await expireEntitlementToFree(userId);
    return;
  }

  if (subscription.scheduledChange?.action === "cancel") {
    await markEntitlementCanceled({
      userId,
      periodEnd: subscription.scheduledChange.effectiveAt,
    });
    return;
  }

  await upsertPremiumEntitlement({
    userId,
    provider: "paddle",
    customerId: subscription.customerId,
    subscriptionId: subscription.id,
    status: subscription.status === "past_due" ? "past_due" : "active",
    periodEnd: getSubscriptionPeriodEnd(subscription),
  });
}

async function handleTransactionCompleted(transaction: TransactionNotification) {
  const userId = getCustomDataString(transaction.customData, "userId");
  if (!userId || !transaction.customerId || !transaction.subscriptionId) return;

  await upsertPremiumEntitlement({
    userId,
    provider: "paddle",
    customerId: transaction.customerId,
    subscriptionId: transaction.subscriptionId,
    periodEnd: transaction.billingPeriod?.endsAt ?? null,
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature") ?? "";

  if (!signature) {
    return NextResponse.json({ error: "Missing Paddle signature" }, { status: 400 });
  }

  let event;
  try {
    event = await unmarshalPaddleWebhook(rawBody, signature);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    if (
      event.eventType === EventName.SubscriptionActivated ||
      event.eventType === EventName.SubscriptionUpdated ||
      event.eventType === EventName.SubscriptionPastDue ||
      event.eventType === EventName.SubscriptionCanceled
    ) {
      await handleSubscriptionEvent(event.eventType, event.data as SubscriptionNotification);
    } else if (event.eventType === EventName.TransactionCompleted) {
      await handleTransactionCompleted(event.data as TransactionNotification);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
