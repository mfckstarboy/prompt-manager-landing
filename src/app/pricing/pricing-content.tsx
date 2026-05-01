"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

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

export function PricingContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAnnual = interval === "annual";

  async function handleUpgrade() {
    setError(null);
    setIsLoading(true);

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
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[28px] border border-border/80 bg-card p-8 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)]">
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

          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="landing-small flex items-center gap-2.5 text-foreground">
                <Check className="h-4 w-4 shrink-0 text-muted-foreground" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {isAuthenticated ? (
              <Button variant="outline" className="landing-ui h-12 w-full" disabled>
                Current plan
              </Button>
            ) : (
              <Button asChild variant="outline" className="landing-ui h-12 w-full">
                <Link href="/signup">Get started free</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-foreground/10 bg-foreground p-8 text-background shadow-[0_28px_70px_-42px_rgba(15,23,42,0.34)]">
          <p className="landing-label text-background/60">Premium</p>
          <div className="mt-3 flex items-end gap-1">
            <span
              className="text-[42px] leading-none tracking-[-0.03em] text-background"
              style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
            >
              {isAnnual ? "$48" : "$5"}
            </span>
            <span className="landing-small mb-1 text-background/60">
              {isAnnual ? "/ year" : "/ month"}
            </span>
          </div>
          <p className="landing-small mt-2 text-background/60">
            {isAnnual ? "$4 / month — save 20%" : "Billed monthly"}
          </p>

          <ul className="mt-6 space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="landing-small flex items-center gap-2.5 text-background">
                <Check className="h-4 w-4 shrink-0 text-background/60" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-3">
            {isAuthenticated ? (
              <Button
                className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90"
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? "Redirecting to checkout…" : "Upgrade to Premium"}
              </Button>
            ) : (
              <>
                <Button asChild className="landing-ui h-12 w-full bg-background text-foreground hover:bg-background/90">
                  <Link href="/signup?plan=premium">Sign up & upgrade</Link>
                </Button>
                <p className="landing-small text-center text-background/60">
                  Already have an account?{" "}
                  <Link href="/login?plan=premium" className="font-medium text-background hover:text-background/80">
                    Sign in
                  </Link>
                </p>
              </>
            )}
            {error ? (
              <p className="landing-small rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-red-300">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <p className="landing-small text-center text-muted-foreground">
        Questions?{" "}
        <a href="/support" className="font-medium text-foreground hover:text-primary">
          Contact support
        </a>
      </p>
    </div>
  );
}
