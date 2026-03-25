import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { Reveal } from "@/components/landing/landing-motion";
import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";

export const authInputClassName =
  "landing-body h-12 w-full rounded-2xl border border-border/90 bg-background px-4 text-foreground outline-none transition-[border-color,box-shadow,transform] duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

export const authLabelClassName = "landing-label block text-foreground/80";

type AuthShellProps = {
  alternateHref?: string;
  alternateLabel?: string;
  alternateQuestion?: string;
  children: ReactNode;
  description: string;
  eyebrow?: string;
  hintText?: string;
  title: string;
};

export function AuthShell({
  alternateHref,
  alternateLabel,
  alternateQuestion,
  children,
  description,
  eyebrow,
  hintText = "Save and reuse prompts inside AI tools.",
  title,
}: AuthShellProps) {
  return (
    <main className="landing-page relative min-h-screen overflow-hidden bg-[#fbfcfe]">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_34%),linear-gradient(180deg,_#ffffff,_#f8fafc)]" />
      <div className="absolute left-1/2 top-36 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-10">
        <div className="w-full">
          <Reveal className="mb-6 text-center" variant="fade" delay={120}>
            <Link href="/" className="inline-flex transition-opacity duration-200 hover:opacity-80">
              <PromptTrayLogo className="h-6 text-foreground" />
            </Link>
          </Reveal>

          <Reveal variant="soft-scale" delay={160} duration={620}>
            <div className="rounded-[30px] border border-border/80 bg-card/95 p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.25)] backdrop-blur sm:p-8">
              {eyebrow ? (
                <div className="landing-label inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-accent-foreground">
                  <LockKeyhole className="h-4 w-4 text-primary" />
                  {eyebrow}
                </div>
              ) : null}

              <h1
                className="mt-6 text-[34px] leading-[38px] tracking-[-0.01em] text-foreground md:text-[40px] md:leading-[44px]"
                style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
              >
                {title}
              </h1>
              <p className="landing-body mt-3 text-muted-foreground">{description}</p>
              {hintText ? (
                <p className="landing-small mt-2 text-muted-foreground">{hintText}</p>
              ) : null}

              <div className="mt-8">{children}</div>

              {alternateQuestion && alternateLabel && alternateHref ? (
                <p className="landing-small mt-6 text-center text-muted-foreground">
                  {alternateQuestion}{" "}
                  <Link
                    href={alternateHref}
                    className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
                  >
                    {alternateLabel}
                  </Link>
                </p>
              ) : null}
            </div>
          </Reveal>

          <Reveal className="mt-6 text-center" variant="fade" delay={220}>
            <Button asChild variant="ghost" size="sm" className="landing-nav gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to landing
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
