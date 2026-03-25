import { Check, Chrome } from "lucide-react";

import { ConstellationBackground } from "@/components/landing/constellation-background";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";
import { Button } from "@/components/ui/button";

const benefits = ["Free to start", "No credit card required", "Works with all AI tools"];

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-foreground px-6 py-24 text-background">
      <ConstellationBackground />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_34%)]" />

      <Reveal className="relative z-10 mx-auto max-w-3xl text-center" variant="fade-up">
        <h2 className="landing-h2 mb-4 text-balance">
          Your prompts. Always ready.
        </h2>
        <p className="landing-body mx-auto mb-8 max-w-xl opacity-80 md:max-w-2xl">
          Join thousands of people who stopped rewriting prompts and started working smarter.
        </p>

        <Button size="lg" className="landing-ui h-14 gap-2 px-8">
          <Chrome className="h-5 w-5" />
          Add to Chrome - Free
        </Button>

        <RevealGroup
          className="mt-8 flex flex-wrap items-center justify-center gap-6"
          variant="fade"
          stagger={70}
        >
          {benefits.map((benefit, index) => (
            <RevealItem key={benefit} index={index} variant="fade">
              <div className="landing-small flex items-center gap-2 opacity-80">
                <Check className="h-4 w-4" />
                {benefit}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Reveal>
    </section>
  );
}
