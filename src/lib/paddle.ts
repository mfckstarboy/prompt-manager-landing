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
  redirectUrl: string;
}) {
  const paddle = getPaddleClient();

  return paddle.transactions.create({
    items: [{ priceId: params.priceId, quantity: 1 }],
    customData: {
      userId: params.userId,
      plan: params.plan,
    },
    checkout: {
      url: params.redirectUrl,
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

export async function unmarshalPaddleWebhook(rawBody: string, signature: string) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("PADDLE_WEBHOOK_SECRET is not configured.");

  const paddle = getPaddleClient();
  return paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
}
