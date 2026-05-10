"use client";

import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CancelDialog } from "@/components/subscription/cancel-dialog";
import { ReactivateDialog } from "@/components/subscription/reactivate-dialog";
import { Button } from "@/components/ui/button";
import { getPremiumCtaState } from "@/lib/pricing-state";
import {
  formatDate,
  isPremiumActive,
  isPremiumCanceled,
  type PlanInfo,
} from "@/lib/subscription";

const FREE_FEATURES = [
  "Up to 30 prompts",
  "Up to 5 categories",
  "Sync across devices",
  "Works in ChatGPT, Claude, Gemini, Perplexity",
];

const PREMIUM_FEATURES = [
  "Unlimited prompts",
  "Unlimited categories",
  "Sync across devices",
  "Works in ChatGPT, Claude, Gemini, Perplexity",
  "Variables in prompts",
  "Version history",
  "Priority support",
];

interface Props {
  planInfo: PlanInfo | null;
  isAuthenticated: boolean;
}

export function PricingContent({ planInfo, isAuthenticated }: Props) {
  const [interval, setInterval] = useState<"monthly" | "annual">(
    planInfo?.billingInterval ?? "monthly"
  );
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [isPlanChangeLoading, setIsPlanChangeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [isReactivateLoading, setIsReactivateLoading] = useState(false);
  const [reactivateError, setReactivateError] = useState<string | null>(null);

  const isAnnual = interval === "annual";
  const premiumActive = planInfo ? isPremiumActive(planInfo) : false;
  const premiumCanceled = planInfo ? isPremiumCanceled(planInfo) : false;
  const premiumCta = getPremiumCtaState({
    isAuthenticated,
    premiumActive,
    premiumCanceled,
    currentInterval: planInfo?.billingInterval ?? null,
    selectedInterval: interval,
  });

  async function handleUpgrade() {
    setUpgradeError(null);
    setIsUpgradeLoading(true);
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Unable to start checkout.");
      }
      const { url } = (await response.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsUpgradeLoading(false);
    }
  }

  async function handlePlanChange() {
    setUpgradeError(null);
    setIsPlanChangeLoading(true);
    try {
      const response = await fetch("/api/subscription/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Unable to update subscription.");
      }
      window.location.reload();
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsPlanChangeLoading(false);
    }
  }

  async function handleCancel() {
    setCancelError(null);
    setIsCancelLoading(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Cancellation failed.");
      }
      window.location.reload();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Something went wrong.");
      setIsCancelLoading(false);
    }
  }

  async function handleReactivate() {
    setReactivateError(null);
    setIsReactivateLoading(true);
    try {
      const res = await fetch("/api/subscription/reactivate", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Reactivation failed.");
      }
      window.location.reload();
    } catch (err) {
      setReactivateError(err instanceof Error ? err.message : "Something went wrong.");
      setIsReactivateLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {(premiumActive || !premiumCanceled) && (
        <div className="flex justify-center">
          <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => setInterval("monthly")}
              className={`landing-small rounded-full px-5 py-2 font-medium transition-colors duration-150 ${
                !isAnnual
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval("annual")}
              className={`landing-small flex items-center gap-2 rounded-full px-5 py-2 font-medium transition-colors duration-150 ${
                isAnnual
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isAnnual ? "bg-white/20 text-background" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Free card */}
        <div className="flex flex-col rounded-[28px] border border-border/80 bg-card p-8 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between">
            <p className="landing-label text-muted-foreground">Free</p>
            {isAuthenticated && !premiumActive && !premiumCanceled && (
              <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-foreground">
                Current plan
              </span>
            )}
          </div>
          <div className="mt-3 flex items-end gap-1">
            <span
              className="text-[42px] leading-none tracking-[-0.03em] text-foreground"
              style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
            >
              $0
            </span>
            <span className="landing-small mb-1 text-muted-foreground">/ month</span>
          </div>
          <p className="landing-small mt-2 text-muted-foreground">Forever free. No card needed.</p>

          <ul className="mt-6 grow space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="landing-small flex items-center gap-2.5 text-foreground">
                <Check className="h-4 w-4 shrink-0 text-muted-foreground" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {!isAuthenticated && (
              <Button asChild variant="outline" className="landing-ui h-12 w-full">
                <Link href="/signup">Get started free</Link>
              </Button>
            )}
            {isAuthenticated && !premiumActive && !premiumCanceled && (
              <Button variant="outline" className="landing-ui h-12 w-full" disabled>
                Current plan
              </Button>
            )}
            {(premiumActive || premiumCanceled) && (
              <Button
                variant="outline"
                className="landing-ui h-12 w-full"
                disabled={premiumCanceled || isCancelLoading}
                onClick={() => setCancelOpen(true)}
              >
                {premiumCanceled
                  ? "Downgrade scheduled"
                  : isCancelLoading
                    ? "Downgrading..."
                    : "Downgrade to Free"}
              </Button>
            )}
          </div>
        </div>

        {/* Premium card */}
        <div className="flex flex-col rounded-[28px] border border-foreground/10 bg-foreground p-8 text-background shadow-[0_28px_70px_-42px_rgba(15,23,42,0.34)]">
          <div className="flex items-center justify-between">
            <p className="landing-label text-background/60">Premium</p>
            {premiumActive && planInfo?.billingInterval === interval ? (
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-background/80">
                <Sparkles className="h-3 w-3" />
                Current plan
              </span>
            ) : premiumCanceled ? (
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-300">
                Cancels {formatDate(planInfo!.periodEnd!)}
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-background/80">
                <Sparkles className="h-3 w-3" />
                Most popular
              </span>
            )}
          </div>

          <div className="mt-3 flex items-end gap-1">
            <span
              className="text-[42px] leading-none tracking-[-0.03em] text-background"
              style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
            >
              {premiumActive || premiumCanceled ? (isAnnual ? "$48" : "$5") : isAnnual ? "$48" : "$5"}
            </span>
            <span className="landing-small mb-1 text-background/60">
              {isAnnual ? "/ year" : "/ month"}
            </span>
          </div>
          <p className="landing-small mt-2 text-background/60">
            {premiumActive && planInfo?.periodEnd && planInfo.billingInterval === interval
              ? `Renews ${formatDate(planInfo.periodEnd)}`
              : premiumActive && planInfo?.billingInterval === "monthly" && isAnnual
                ? "Upgrade from monthly to annual"
              : premiumCanceled && planInfo?.periodEnd
                ? `Access until ${formatDate(planInfo.periodEnd)}`
                : isAnnual
                  ? "$4 / month — save 20%"
                  : "Billed monthly"}
          </p>

          <ul className="mt-6 grow space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="landing-small flex items-center gap-2.5 text-background">
                <Check className="h-4 w-4 shrink-0 text-background/60" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-3">
            {premiumCta.action === "signup" && (
              <>
                <Button
                  asChild
                  className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                >
                  <Link href="/signup?plan=premium">Sign up &amp; upgrade</Link>
                </Button>
                <p className="landing-small text-center text-background/60">
                  Already have an account?{" "}
                  <Link href="/login?plan=premium" className="font-medium text-background hover:text-background/80">
                    Sign in
                  </Link>
                </p>
              </>
            )}
            {premiumCta.action === "checkout" && (
              <Button
                className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                onClick={handleUpgrade}
                disabled={isUpgradeLoading}
              >
                {isUpgradeLoading ? "Redirecting to checkout…" : "Upgrade to Premium"}
              </Button>
            )}
            {premiumCta.action === "current" && (
              <Button
                className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                disabled
              >
                Current plan
              </Button>
            )}
            {premiumCta.action === "upgrade" && (
              <Button
                className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                onClick={handlePlanChange}
                disabled={isPlanChangeLoading}
              >
                {isPlanChangeLoading ? "Updating plan..." : "Upgrade plan"}
              </Button>
            )}
            {premiumCta.action === "reactivate" && (
              <>
                <Button
                  className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                  onClick={() => setReactivateOpen(true)}
                  disabled={isReactivateLoading}
                >
                  Reactivate subscription
                </Button>
                <p className="landing-small text-center text-background/50">
                  No charge — resumes your existing billing cycle
                </p>
              </>
            )}
            {upgradeError && (
              <p className="landing-small rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-red-300">
                {upgradeError}
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="landing-small text-center text-muted-foreground">
        Questions?{" "}
        <a href="/support" className="font-medium text-foreground hover:text-primary">
          Contact support
        </a>
      </p>

      <div className="mx-auto max-w-3xl space-y-8 rounded-[28px] border border-border/80 bg-card px-6 py-8 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)] sm:px-8">
        <section>
          <h2
            className="text-[28px] leading-[32px] tracking-[-0.01em] text-foreground"
            style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
          >
            AI prompt manager pricing
          </h2>
          <p className="landing-body mt-4 text-muted-foreground">
            PromptTray pricing is designed for people who want a reusable prompt workflow across
            ChatGPT, Claude, Gemini, and Perplexity. The free plan gives you a simple way to save
            and organize prompts, while Premium is built for people whose prompt library is growing
            and needs more flexibility.
          </p>
        </section>

        <section>
          <h2
            className="text-[28px] leading-[32px] tracking-[-0.01em] text-foreground"
            style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
          >
            Who the free plan is for
          </h2>
          <p className="landing-body mt-4 text-muted-foreground">
            The free plan is a good fit if you are just starting to build a prompt library, only
            save your best recurring prompts, or want a cleaner system than leaving them buried in
            chat history. It covers the core workflow of saving, organizing, syncing, and reusing
            prompts across the AI tools you already use.
          </p>
        </section>

        <section>
          <h2
            className="text-[28px] leading-[32px] tracking-[-0.01em] text-foreground"
            style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
          >
            Who should upgrade to PromptTray Premium
          </h2>
          <p className="landing-body mt-4 text-muted-foreground">
            PromptTray Premium makes sense when you rely on prompts daily, need unlimited prompts
            and categories, or want more advanced prompt management features like variables and
            version history. If you are maintaining reusable prompt workflows for writing, coding,
            research, support, or team handoff across multiple AI platforms, Premium helps keep
            that system easier to scale.
          </p>
        </section>
      </div>

      <CancelDialog
        open={cancelOpen}
        periodEnd={planInfo?.periodEnd ?? null}
        isLoading={isCancelLoading}
        error={cancelError}
        onConfirm={handleCancel}
        onClose={() => { setCancelOpen(false); setCancelError(null); }}
      />
      <ReactivateDialog
        open={reactivateOpen}
        isLoading={isReactivateLoading}
        error={reactivateError}
        onConfirm={handleReactivate}
        onClose={() => { setReactivateOpen(false); setReactivateError(null); }}
      />
    </div>
  );
}
