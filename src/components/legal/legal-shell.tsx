import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";

type LegalShellProps = {
  children: ReactNode;
  description: string;
  lastUpdated?: string;
  title: string;
};

export function LegalShell({ children, description, lastUpdated, title }: LegalShellProps) {
  return (
    <main className="landing-page min-h-screen bg-[#fbfcfe] text-foreground">
      <div className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
            <PromptTrayLogo className="h-6 text-foreground" />
          </Link>

          <Button asChild variant="ghost" size="sm" className="landing-nav gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to landing
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-18">
        <article className="mx-auto max-w-3xl rounded-[30px] border border-border/80 bg-card px-6 py-8 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.2)] sm:px-10 sm:py-10">
          <header className="mb-10">
            <h1
              className="text-[38px] leading-[42px] tracking-[-0.01em] text-foreground md:text-[48px] md:leading-[52px]"
              style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
            >
              {title}
            </h1>
            {lastUpdated ? (
              <p className="landing-label mt-4 text-muted-foreground">Last updated: {lastUpdated}</p>
            ) : null}
            <p className="landing-body mt-4 max-w-2xl text-muted-foreground">{description}</p>
          </header>

          <div className="space-y-10">{children}</div>
        </article>

        <footer className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-between gap-4 border-t border-border/80 pt-6 text-center sm:flex-row sm:text-left">
          <p className="landing-small text-muted-foreground">
            © {new Date().getFullYear()} PromptTray
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/privacy"
              className="landing-nav text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="landing-nav text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="landing-nav text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Support
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}

type LegalSectionProps = {
  children: ReactNode;
  title: string;
};

export function LegalSection({ children, title }: LegalSectionProps) {
  return (
    <section>
      <h2
        className="text-[28px] leading-[32px] tracking-[-0.01em] text-foreground"
        style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
      >
        {title}
      </h2>
      <div className="landing-body mt-4 space-y-4 text-muted-foreground">{children}</div>
    </section>
  );
}
