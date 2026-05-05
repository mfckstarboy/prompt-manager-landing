import { Environment, Paddle } from "@paddle/paddle-node-sdk";

type PaddleEnv = "sandbox" | "production";

export function getPaddleEnv(): PaddleEnv {
  return process.env.PADDLE_ENV === "production" && process.env.NODE_ENV === "production"
    ? "production"
    : "sandbox";
}

export function getPaddleApiKey() {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) throw new Error("PADDLE_API_KEY is not configured.");
  return apiKey;
}

export function getPaddleClient() {
  return new Paddle(getPaddleApiKey(), {
    environment: getPaddleEnv() === "production" ? Environment.production : Environment.sandbox,
  });
}

export async function createPaddleCheckoutTransaction(params: {
  priceId: string;
  userId: string;
  plan: "premium";
  checkoutPageUrl: string;
}) {
  const paddle = getPaddleClient();

  return paddle.transactions.create({
    items: [{ priceId: params.priceId, quantity: 1 }],
    customData: {
      userId: params.userId,
      plan: params.plan,
    },
    checkout: {
      url: params.checkoutPageUrl,
    },
  });
}

export async function cancelPaddleSubscription(subscriptionId: string) {
  const paddle = getPaddleClient();
  return paddle.subscriptions.cancel(subscriptionId, {
    effectiveFrom: "next_billing_period",
  });
}

export async function removePaddleScheduledCancellation(subscriptionId: string) {
  const paddle = getPaddleClient();
  return paddle.subscriptions.update(subscriptionId, {
    scheduledChange: null,
  });
}

export async function getPaddleSubscriptionBillingInterval(subscriptionId: string) {
  const paddle = getPaddleClient();
  const subscription = await paddle.subscriptions.get(subscriptionId);
  const interval = subscription.billingCycle.interval;

  if (interval === "year") return "annual";
  if (interval === "month") return "monthly";
  return null;
}

export async function switchPaddleSubscriptionToAnnual(subscriptionId: string) {
  const annualPriceId = process.env.PADDLE_ANNUAL_PRICE_ID;
  if (!annualPriceId) throw new Error("Annual plan is not configured.");

  const paddle = getPaddleClient();
  return paddle.subscriptions.update(subscriptionId, {
    items: [{ priceId: annualPriceId, quantity: 1 }],
    onPaymentFailure: "prevent_change",
    prorationBillingMode: "prorated_immediately",
  });
}

export async function unmarshalPaddleWebhook(rawBody: string, signature: string) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("PADDLE_WEBHOOK_SECRET is not configured.");

  const paddle = getPaddleClient();
  return paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
}
