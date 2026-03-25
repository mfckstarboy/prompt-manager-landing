"use client";

import Link from "next/link";
import { useState } from "react";
import { Chrome, Menu, X } from "lucide-react";

import { Reveal } from "@/components/landing/landing-motion";
import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";

const navLinkClassName =
  "landing-nav relative text-muted-foreground transition-[color,opacity] duration-200 hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:opacity-60 after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <Reveal className="mx-auto max-w-6xl" variant="fade" delay={140} duration={520}>
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
            <PromptTrayLogo className="h-6 text-foreground" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className={navLinkClassName}>
              Features
            </a>
            <a href="#how-it-works" className={navLinkClassName}>
              How it works
            </a>
            <a href="#use-cases" className={navLinkClassName}>
              Use cases
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="ghost" size="sm" className="landing-ui">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" className="landing-ui gap-2">
              <Chrome className="h-4 w-4" />
              Add to Chrome
            </Button>
          </div>

          <button
            type="button"
            className="rounded-full p-2 transition-colors duration-200 hover:bg-accent md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Reveal>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background/95 md:hidden">
          <nav className="flex flex-col gap-4 p-4">
            <a href="#features" className="landing-nav text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a
              href="#how-it-works"
              className="landing-nav text-muted-foreground hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#use-cases"
              className="landing-nav text-muted-foreground hover:text-foreground"
            >
              Use cases
            </a>
            <hr className="border-border" />
            <Button asChild variant="ghost" size="sm" className="landing-ui justify-start">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" className="landing-ui gap-2">
              <Chrome className="h-4 w-4" />
              Add to Chrome
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
