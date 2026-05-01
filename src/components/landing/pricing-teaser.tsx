import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";
import { Button } from "@/components/ui/button";

const FREE_HIGHLIGHTS = [
  "Up to 30 prompts",
  "Up to 5 categories",
  "Works in ChatGPT, Claude, Gemini, Perplexity",
  "Sync across devices",
];

const PREMIUM_HIGHLIGHTS = [
  "Unlimited prompts & categories",
  "Variables in prompts",
  "Version history",
  "Works in ChatGPT, Claude, Gemini, Perplexity",
  "Sync across devices",
  "Priority support",
];

export function PricingTeaser() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-16 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4">Simple pricing</h2>
          <p className="landing-body mx-auto max-w-xl text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>
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
                  <Link href="/signup">Get started free</Link>
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
                  className="text-[42px] leading-none tracking-[-0.03em] text-background"
                  style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                >
                  $5
                </span>
                <span className="landing-small mb-1 text-background/60">/ month</span>
              </div>
              <p className="landing-small mt-2 text-background/60">
                Or $48 / year — save 20%
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
                  <Link href="/pricing">See pricing & upgrade</Link>
                </Button>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
