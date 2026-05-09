import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/chrome-web-store";

type GuideSection = {
  body: ReactNode;
  title: string;
};

type GuideFaq = {
  answer: ReactNode;
  question: string;
};

type GuideLink = {
  href: string;
  label: string;
};

type GuideShellProps = {
  ctaDescription: ReactNode;
  ctaTitle: string;
  description: string;
  faqs: GuideFaq[];
  lastUpdated: string;
  relatedLinks: GuideLink[];
  sections: GuideSection[];
  title: string;
};

export function GuideShell({
  ctaDescription,
  ctaTitle,
  description,
  faqs,
  lastUpdated,
  relatedLinks,
  sections,
  title,
}: GuideShellProps) {
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
            <p className="landing-label text-muted-foreground">Guide</p>
            <h1
              className="mt-4 text-[38px] leading-[42px] tracking-[-0.01em] text-foreground md:text-[48px] md:leading-[52px]"
              style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
            >
              {title}
            </h1>
            <p className="landing-label mt-4 text-muted-foreground">Last updated: {lastUpdated}</p>
            <p className="landing-body mt-4 max-w-2xl text-muted-foreground">{description}</p>
          </header>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2
                  className="text-[28px] leading-[32px] tracking-[-0.01em] text-foreground"
                  style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                >
                  {section.title}
                </h2>
                <div className="landing-body mt-4 space-y-4 text-muted-foreground">
                  {section.body}
                </div>
              </section>
            ))}

            <section>
              <h2
                className="text-[28px] leading-[32px] tracking-[-0.01em] text-foreground"
                style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
              >
                FAQ
              </h2>
              <div className="mt-4 space-y-5">
                {faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="landing-h4">{faq.question}</h3>
                    <div className="landing-body mt-2 space-y-3 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-border/80 bg-muted/30 p-6 sm:p-8">
              <h2
                className="text-[28px] leading-[32px] tracking-[-0.01em] text-foreground"
                style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
              >
                {ctaTitle}
              </h2>
              <div className="landing-body mt-4 space-y-4 text-muted-foreground">
                {ctaDescription}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="landing-ui h-12 px-6">
                  <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noreferrer">
                    Add PromptTray to Chrome
                  </a>
                </Button>
                <Button asChild variant="outline" className="landing-ui h-12 px-6">
                  <Link href="/pricing">View pricing</Link>
                </Button>
              </div>
            </section>

            <section>
              <h2
                className="text-[28px] leading-[32px] tracking-[-0.01em] text-foreground"
                style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
              >
                Related resources
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group rounded-2xl border border-border/80 bg-background px-4 py-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_16px_30px_-24px_rgba(15,23,42,0.24)]"
                  >
                    <span className="landing-body flex items-center justify-between gap-4 text-foreground">
                      {link.label}
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </article>

        <footer className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-between gap-4 border-t border-border/80 pt-6 text-center sm:flex-row sm:text-left">
          <p className="landing-small text-muted-foreground">
            © {new Date().getFullYear()} PromptTray
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/pricing"
              className="landing-nav text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/support"
              className="landing-nav text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Support
            </Link>
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
          </nav>
        </footer>
      </div>
    </main>
  );
}
