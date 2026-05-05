import { getPaddleClient } from "@/lib/paddle";

export type PaddlePortalIntent = "manage" | "update-payment-method";

type PaddlePortalSessionLike = {
  urls: {
    general: {
      overview: string;
    };
    subscriptions?: Array<{
      id: string;
      updateSubscriptionPaymentMethod?: string;
    }>;
  };
};

export function selectPaddlePortalUrl(
  session: PaddlePortalSessionLike,
  params: { subscriptionId: string | null; intent: PaddlePortalIntent }
) {
  if (params.intent === "update-payment-method" && params.subscriptionId) {
    const subscriptionUrl = session.urls.subscriptions?.find(
      (subscription) => subscription.id === params.subscriptionId
    );

    if (subscriptionUrl?.updateSubscriptionPaymentMethod) {
      return subscriptionUrl.updateSubscriptionPaymentMethod;
    }
  }

  return session.urls.general.overview;
}

export async function createPaddlePortalUrl(params: {
  customerId: string;
  subscriptionId: string | null;
  intent: PaddlePortalIntent;
}) {
  const paddle = getPaddleClient();
  const subscriptionIds = params.subscriptionId ? [params.subscriptionId] : [];
  const session = await paddle.customerPortalSessions.create(params.customerId, subscriptionIds);

  return selectPaddlePortalUrl(session, {
    subscriptionId: params.subscriptionId,
    intent: params.intent,
  });
}
