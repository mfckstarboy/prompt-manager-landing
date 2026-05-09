import { ArrowRight, Chrome, Sparkles } from "lucide-react";

import { HeroDemoPlayer } from "@/components/landing/hero-demo-player";
import { Reveal } from "@/components/landing/landing-motion";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/chrome-web-store";

export function Hero() {
  return (
    <section className="px-6 pb-20 pt-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-16 max-w-3xl text-center" variant="fade-up" delay={160}>
          <div className="landing-label mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-accent-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Works in ChatGPT, Claude, Gemini &amp; Perplexity
          </div>

          <h1 className="landing-h1 mb-6 text-balance">
            Save prompts once. Use them anywhere.
          </h1>

          <p className="landing-body-lg mx-auto mb-8 max-w-3xl text-muted-foreground text-pretty">
            Save prompts once, stay organized, and insert them in ChatGPT, Claude, Gemini, and
            Perplexity with one click.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="landing-ui h-12 gap-2 px-6">
              <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noreferrer">
                <Chrome className="h-5 w-5" />
                Add to Chrome Free
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg" className="landing-ui h-12 gap-2 px-6">
              <a href="#how-it-works">
                See how it works
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <p className="landing-small pt-6 text-muted-foreground">
            Free plan available &middot; No credit card required
          </p>
        </Reveal>

        <Reveal
          className="relative w-full"
          variant="soft-scale"
          delay={260}
          duration={700}
        >
          <HeroDemoPlayer />
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-t from-muted/50 to-transparent opacity-50 blur-3xl" />
        </Reveal>
      </div>
    </section>
  );
}
