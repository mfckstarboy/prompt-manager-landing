"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { Check, Chrome } from "lucide-react";

import { ConstellationBackground } from "@/components/landing/constellation-background";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/chrome-web-store";

const benefits = ["Free to start", "Works in 4 AI tools", "No credit card required"];

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

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || prefersReducedMotion) {
      return;
    }

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

      section.style.setProperty("--cta-parallax-x", `${pointerCurrentX.toFixed(4)}px`);
      section.style.setProperty("--cta-parallax-y", `${pointerCurrentY.toFixed(4)}px`);
      section.style.setProperty("--cta-scroll-shift", `${scrollCurrent.toFixed(4)}px`);

      frameId = window.requestAnimationFrame(animate);
    };

    const updateScrollTarget = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, progress));

      scrollTarget = (clampedProgress - 0.5) * 36;
    };

    const updatePointerTarget = (clientX: number, clientY: number) => {
      const rect = section.getBoundingClientRect();
      const normalizedX = (clientX - rect.left) / rect.width - 0.5;
      const normalizedY = (clientY - rect.top) / rect.height - 0.5;

      pointerTargetX = normalizedX * 26;
      pointerTargetY = normalizedY * 22;
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointerTarget(event.clientX, event.clientY);
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

  const ctaStyle = {
    "--cta-parallax-x": "0px",
    "--cta-parallax-y": "0px",
    "--cta-scroll-shift": "0px",
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-foreground px-6 py-24 text-background"
      style={ctaStyle}
    >
      <ConstellationBackground className="scale-[1.03]" />

      <div
        className="pointer-events-none absolute inset-[-8%] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_34%)] opacity-90 transition-transform duration-300"
        style={{
          transform: prefersReducedMotion
            ? undefined
            : "translate3d(calc(var(--cta-parallax-x) * -0.45), calc(var(--cta-scroll-shift) * -0.35), 0)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-[-12%] bottom-[-28%] top-[36%] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.12),_transparent_62%)] blur-3xl"
        style={{
          transform: prefersReducedMotion
            ? undefined
            : "translate3d(calc(var(--cta-parallax-x) * 0.25), calc(var(--cta-parallax-y) * 0.35 + var(--cta-scroll-shift) * 0.45), 0)",
        }}
      />

      <Reveal
        className="relative z-10 mx-auto max-w-3xl text-center"
        variant="fade-up"
      >
        <h2 className="landing-h2 mb-4 text-balance">
          Keep every great prompt one click away
        </h2>

        <div
          style={{
            transform: prefersReducedMotion
              ? undefined
              : "translate3d(calc(var(--cta-parallax-x) * 0.12), calc(var(--cta-parallax-y) * 0.16 + var(--cta-scroll-shift) * 0.2), 0)",
          }}
        >
          <p className="landing-body mx-auto mb-8 max-w-xl opacity-80 md:max-w-2xl">
            Install PromptTray and turn scattered ChatGPT, Claude, Gemini, and Perplexity prompts
            into one organized prompt library.
          </p>

          <div
            style={{
              transform: prefersReducedMotion
                ? undefined
                : "translate3d(calc(var(--cta-parallax-x) * 0.2), calc(var(--cta-parallax-y) * 0.24 + var(--cta-scroll-shift) * 0.3), 0)",
            }}
          >
            <Button asChild size="lg" className="landing-ui h-14 gap-2 px-8">
              <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noreferrer">
                <Chrome className="h-5 w-5" />
                Add to Chrome Free
              </a>
            </Button>
          </div>

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
        </div>
      </Reveal>
    </section>
  );
}
