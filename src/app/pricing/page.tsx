import type { Metadata } from "next";
import Link from "next/link";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { getPaddleSubscriptionBillingInterval } from "@/lib/paddle";
import { type PlanInfo } from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";

import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let planInfo: PlanInfo | null = null;
  if (user) {
    const { data } = await supabase
      .from("user_entitlements")
      .select("plan, status, current_period_end, provider_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();
    let billingInterval: PlanInfo["billingInterval"] = null;

    if (data?.provider_subscription_id) {
      try {
        billingInterval = await getPaddleSubscriptionBillingInterval(data.provider_subscription_id);
      } catch {
        billingInterval = null;
      }
    }

    planInfo = data
      ? {
          billingInterval,
          plan: data.plan as PlanInfo["plan"],
          status: data.status as PlanInfo["status"],
          periodEnd: data.current_period_end ?? null,
        }
      : { billingInterval: null, plan: "free", status: "inactive", periodEnd: null };
  }

  const isAuthenticated = Boolean(user);

  return (
    <main className="landing-page min-h-screen bg-[#f6f7fb] text-foreground">
      <div className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
            <PromptTrayLogo className="h-6 text-foreground" />
          </Link>
          {isAuthenticated ? (
            <Link
              href="/app"
              className="landing-small font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="landing-small font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-10 text-center">
          <p className="landing-label text-muted-foreground">Pricing</p>
          <h1
            className="mt-4 text-[44px] leading-[46px] tracking-[-0.01em] text-foreground md:text-[58px] md:leading-[60px]"
            style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
          >
            Simple, honest pricing
          </h1>
          <p className="landing-body mt-4 text-muted-foreground">
            Start free. Upgrade when your prompt library grows.
          </p>
        </div>

        <PricingContent planInfo={planInfo} isAuthenticated={isAuthenticated} />
      </div>
    </main>
  );
}
