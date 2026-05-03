"use client";

import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";
import { Button } from "@/components/ui/button";

const FREE_HIGHLIGHTS = [
  "Works in ChatGPT, Claude, Gemini, Perplexity",
  "Up to 30 prompts",
  "Up to 5 categories",
  "Sync across devices",
];

const PREMIUM_HIGHLIGHTS = [
  "Unlimited prompts & categories",
  "Variables in prompts — build reusable templates",
  "Version history",
  "Works in ChatGPT, Claude, Gemini, Perplexity",
  "Sync across devices",
  "Priority support",
];

type BillingPeriod = "monthly" | "yearly";

interface Props {
  userPlan: "free" | "premium" | null;
}

export function PricingTeaserContent({ userPlan }: Props) {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isYearly = billing === "yearly";

  async function handleUpgrade() {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: isYearly ? "annual" : "monthly" }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Unable to start checkout.");
      }
      const { url } = (await response.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-10 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4">Start free. Upgrade when you&apos;re ready.</h2>
          <p className="landing-body mx-auto max-w-xl text-muted-foreground">
            No lock-in, no card needed. Most users are surprised how far the free plan takes them.
          </p>
        </Reveal>

        <Reveal className="mb-10 flex justify-center" variant="fade-up">
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
                !isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
                isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                –20%
              </span>
            </button>
          </div>
        </Reveal>

        <RevealGroup className="grid gap-6 md:grid-cols-2" stagger={80}>
          <RevealItem index={0}>
            <div className="flex h-full flex-col rounded-[28px] border border-border/80 bg-card p-8 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)]">
              <div className="flex items-center justify-between">
                <p className="landing-label text-muted-foreground">Free</p>
                {userPlan === "free" && (
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
                {FREE_HIGHLIGHTS.map((feature) => (
                  <li key={feature} className="landing-small flex items-center gap-2.5 text-foreground">
                    <Check className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {userPlan === null && (
                  <Button variant="outline" className="landing-ui h-12 w-full" asChild>
                    <Link href="/login">Log in to subscribe</Link>
                  </Button>
                )}
                {userPlan === "free" && (
                  <Button variant="outline" className="landing-ui h-12 w-full" disabled>
                    Current plan
                  </Button>
                )}
                {userPlan === "premium" && (
                  <Button variant="outline" className="landing-ui h-12 w-full" asChild>
                    <Link href="/pricing">Change subscription</Link>
                  </Button>
                )}
              </div>
            </div>
          </RevealItem>

          <RevealItem index={1}>
            <div className="flex h-full flex-col rounded-[28px] border border-foreground/10 bg-foreground p-8 text-background shadow-[0_28px_70px_-42px_rgba(15,23,42,0.34)]">
              <div className="flex items-center justify-between">
                <p className="landing-label text-background/60">Premium</p>
                {userPlan === "premium" ? (
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-background/80">
                    <Sparkles className="h-3 w-3" />
                    Current plan
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
                  className="text-[42px] leading-none tracking-[-0.03em] text-background transition-all duration-200"
                  style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                >
                  {isYearly ? "$48" : "$5"}
                </span>
                <span className="landing-small mb-1 text-background/60">
                  {isYearly ? "/ year" : "/ month"}
                </span>
              </div>
              <p className="landing-small mt-2 text-background/60">
                {isYearly ? "That's $4 / month — save 20%" : "Or $48 / year — save 20%"}
              </p>

              <ul className="mt-6 grow space-y-3">
                {PREMIUM_HIGHLIGHTS.map((feature) => (
                  <li key={feature} className="landing-small flex items-center gap-2.5 text-background">
                    <Check className="h-4 w-4 shrink-0 text-background/60" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-3">
                {userPlan === null && (
                  <Button
                    className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                    asChild
                  >
                    <Link href={`/login?plan=premium&billing=${billing}`}>Log in to subscribe</Link>
                  </Button>
                )}
                {userPlan === "free" && (
                  <Button
                    className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                    onClick={handleUpgrade}
                    disabled={isLoading}
                  >
                    {isLoading ? "Redirecting to checkout…" : "Upgrade to Premium"}
                  </Button>
                )}
                {userPlan === "premium" && (
                  <Button
                    className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                    disabled
                  >
                    Current plan
                  </Button>
                )}
                {error && (
                  <p className="landing-small rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-red-300">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
