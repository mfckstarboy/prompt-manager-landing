"use client";

import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { ConstellationBackground } from "@/components/landing/constellation-background";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  isPremiumActive,
  isPremiumCanceled,
  type PlanInfo,
} from "@/lib/subscription";

const EXTENSION_WELCOME_URL = "/extension/welcome";

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
  planInfo: PlanInfo | null;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

export function PricingTeaserContent({ planInfo }: Props) {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || prefersReducedMotion) return;

    let frameId = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerCurrentX = 0;
    let pointerCurrentY = 0;
    let scrollTarget = 0;
    let scrollCurrent = 0;

    const animate = () => {
      pointerCurrentX += (pointerTargetX - pointerCurrentX) * 0.08;
      pointerCurrentY += (pointerTargetY - pointerCurrentY) * 0.08;
      scrollCurrent += (scrollTarget - scrollCurrent) * 0.08;

      section.style.setProperty("--pricing-parallax-x", `${pointerCurrentX.toFixed(4)}px`);
      section.style.setProperty("--pricing-parallax-y", `${pointerCurrentY.toFixed(4)}px`);
      section.style.setProperty("--pricing-scroll-shift", `${scrollCurrent.toFixed(4)}px`);

      frameId = window.requestAnimationFrame(animate);
    };

    const updateScrollTarget = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      scrollTarget = (Math.max(0, Math.min(1, progress)) - 0.5) * 36;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      pointerTargetX = ((event.clientX - rect.left) / rect.width - 0.5) * 26;
      pointerTargetY = ((event.clientY - rect.top) / rect.height - 0.5) * 22;
    };

    const handlePointerLeave = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    };

    updateScrollTarget();
    frameId = window.requestAnimationFrame(animate);

    section.addEventListener("pointermove", handlePointerMove);
    section.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    window.addEventListener("resize", updateScrollTarget);

    return () => {
      window.cancelAnimationFrame(frameId);
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", updateScrollTarget);
      window.removeEventListener("resize", updateScrollTarget);
    };
  }, [prefersReducedMotion]);
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [isReactivateLoading, setIsReactivateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isYearly = billing === "yearly";

  const premiumActive = planInfo ? isPremiumActive(planInfo) : false;
  const premiumCanceled = planInfo ? isPremiumCanceled(planInfo) : false;

  async function handleUpgrade() {
    setError(null);
    setIsUpgradeLoading(true);
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
      setIsUpgradeLoading(false);
    }
  }

  async function handleReactivate() {
    setError(null);
    setIsReactivateLoading(true);
    try {
      const response = await fetch("/api/subscription/reactivate", { method: "POST" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Unable to reactivate subscription.");
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsReactivateLoading(false);
    }
  }

  const pricingStyle = {
    "--pricing-parallax-x": "0px",
    "--pricing-parallax-y": "0px",
    "--pricing-scroll-shift": "0px",
  } as CSSProperties;

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative overflow-hidden bg-foreground px-6 py-24 text-background"
      style={pricingStyle}
    >
      <ConstellationBackground className="scale-[1.03]" />

      <div
        className="pointer-events-none absolute inset-[-8%] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_34%)] opacity-90 transition-transform duration-300"
        style={{
          transform: prefersReducedMotion
            ? undefined
            : "translate3d(calc(var(--pricing-parallax-x) * -0.45), calc(var(--pricing-scroll-shift) * -0.35), 0)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-[-12%] bottom-[-28%] top-[36%] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.12),_transparent_62%)] blur-3xl"
        style={{
          transform: prefersReducedMotion
            ? undefined
            : "translate3d(calc(var(--pricing-parallax-x) * 0.25), calc(var(--pricing-parallax-y) * 0.35 + var(--pricing-scroll-shift) * 0.45), 0)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <Reveal className="mb-10 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4">Start free. Upgrade when your prompt library grows.</h2>
          <p className="landing-body mx-auto max-w-xl text-background/70">
            Use PromptTray free for everyday prompt organization, then upgrade for unlimited
            prompts, variables, and version history.
          </p>
        </Reveal>

        <Reveal className="mb-10 flex justify-center" variant="fade-up">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
                !isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-background/60 hover:text-background"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
                isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-background/60 hover:text-background"
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
                {planInfo && !premiumActive && !premiumCanceled && (
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
                {!planInfo && (
                  <Button variant="outline" className="landing-ui h-12 w-full text-foreground" asChild>
                    <Link href={EXTENSION_WELCOME_URL}>Start free</Link>
                  </Button>
                )}
                {planInfo && !premiumActive && !premiumCanceled && (
                  <Button variant="outline" className="landing-ui h-12 w-full text-foreground" disabled>
                    Current plan
                  </Button>
                )}
                {(premiumActive || premiumCanceled) && (
                  <Button variant="outline" className="landing-ui h-12 w-full text-foreground" asChild>
                    <Link href="/account">Manage subscription</Link>
                  </Button>
                )}
              </div>
            </div>
          </RevealItem>

          <RevealItem index={1}>
            <div className="flex h-full flex-col rounded-[28px] border border-blue-400/30 bg-primary p-8 text-primary-foreground shadow-[0_32px_80px_-40px_rgba(59,130,246,0.58)]">
              <div className="flex items-center justify-between">
                <p className="landing-label text-primary-foreground/70">Premium</p>
                {premiumActive ? (
                  <span className="flex items-center gap-1 rounded-full bg-white/16 px-3 py-1 text-[11px] font-semibold text-primary-foreground/90">
                    <Sparkles className="h-3 w-3" />
                    Current plan
                  </span>
                ) : premiumCanceled ? (
                  <span className="flex items-center gap-1 rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold text-primary-foreground/90">
                    Cancels {formatDate(planInfo!.periodEnd!)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-white/16 px-3 py-1 text-[11px] font-semibold text-primary-foreground/90">
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
                <span className="landing-small mb-1 text-primary-foreground/72">
                  {isYearly ? "/ year" : "/ month"}
                </span>
              </div>
              <p className="landing-small mt-2 text-primary-foreground/72">
                {isYearly ? "That's $4 / month — save 20%" : "Or $48 / year — save 20%"}
              </p>

              <ul className="mt-6 grow space-y-3">
                {PREMIUM_HIGHLIGHTS.map((feature) => (
                  <li
                    key={feature}
                    className="landing-small flex items-center gap-2.5 text-primary-foreground"
                  >
                    <Check className="h-4 w-4 shrink-0 text-primary-foreground/72" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-3">
                {!planInfo && (
                  <>
                    <Button
                      className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                      asChild
                    >
                      <Link href="/signup?plan=premium">Get Premium</Link>
                    </Button>
                    <p className="landing-small text-center text-primary-foreground/72">
                      Already have an account?{" "}
                      <Link href="/login?plan=premium" className="font-medium text-primary-foreground hover:text-primary-foreground/80">
                        Sign in
                      </Link>
                    </p>
                  </>
                )}
                {planInfo && !premiumActive && !premiumCanceled && (
                  <Button
                    className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                    onClick={handleUpgrade}
                    disabled={isUpgradeLoading}
                  >
                    {isUpgradeLoading ? "Redirecting to checkout…" : "Upgrade to Premium"}
                  </Button>
                )}
                {premiumActive && (
                  <Button
                    className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                    disabled
                  >
                    Current plan
                  </Button>
                )}
                {premiumCanceled && (
                  <>
                    <Button
                      className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                      onClick={handleReactivate}
                      disabled={isReactivateLoading}
                    >
                      {isReactivateLoading ? "Reactivating…" : "Reactivate subscription"}
                    </Button>
                    <p className="landing-small text-center text-primary-foreground/72">
                      No charge — resumes your existing billing cycle
                    </p>
                  </>
                )}
                {error && (
                  <p className="landing-small rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-primary-foreground">
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

