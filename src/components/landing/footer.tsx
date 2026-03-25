import Link from "next/link";

import { Reveal } from "@/components/landing/landing-motion";
import { PromptTrayLogo } from "@/components/landing/prompttray-logo";

const footerLinkClassName =
  "landing-nav relative text-muted-foreground transition-[color,opacity] duration-200 hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:opacity-60 after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <Reveal className="mx-auto max-w-6xl" variant="fade-up">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <PromptTrayLogo className="h-6 text-foreground" />

          <nav className="flex items-center gap-8">
            <Link href="/privacy" className={footerLinkClassName}>
              Privacy
            </Link>
            <Link href="/terms" className={footerLinkClassName}>
              Terms
            </Link>
            <Link href="/support" className={footerLinkClassName}>
              Support
            </Link>
          </nav>

          <a
            href="mailto:support@prompttray.com"
            className="landing-nav text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            support@prompttray.com
          </a>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="landing-small text-muted-foreground">
            &copy; {new Date().getFullYear()} PromptTray. All rights reserved.
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
