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

export function PricingTeaser() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const isYearly = billing === "yearly";

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
              <p className="landing-label text-muted-foreground">Free</p>
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
                <Button variant="outline" className="landing-ui h-12 w-full" asChild>
                  <Link href="/login">Log in to subscribe</Link>
                </Button>
              </div>
            </div>
          </RevealItem>

          <RevealItem index={1}>
            <div className="flex h-full flex-col rounded-[28px] border border-foreground/10 bg-foreground p-8 text-background shadow-[0_28px_70px_-42px_rgba(15,23,42,0.34)]">
              <div className="flex items-center justify-between">
                <p className="landing-label text-background/60">Premium</p>
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-background/80">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </span>
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

              <div className="mt-8">
                <Button
                  className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                  asChild
                >
                  <Link href={`/login?plan=premium&billing=${billing}`}>Log in to subscribe</Link>
                </Button>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
