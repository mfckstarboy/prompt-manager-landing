import type { Metadata } from "next";
import Link from "next/link";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function UpgradeFailedPage() {
  return (
    <main className="landing-page flex min-h-screen flex-col bg-[#f6f7fb] text-foreground">
      <div className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center px-6 py-4">
          <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
            <PromptTrayLogo className="h-6 text-foreground" />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-[32px] border border-red-200 bg-red-50/80 px-8 py-10 text-center shadow-[0_28px_70px_-48px_rgba(15,23,42,0.24)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1
            className="mt-6 text-[36px] leading-[40px] tracking-[-0.01em] text-foreground"
            style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
          >
            Payment unsuccessful
          </h1>

          <p className="landing-body mt-4 text-muted-foreground">
            Your payment could not be completed. No charge has been made to your account.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button asChild className="landing-ui h-12 w-full">
              <Link href="/pricing">Try once more</Link>
            </Button>
            <Button asChild variant="outline" className="landing-ui h-12 w-full">
              <Link href="/pricing">Go to pricing</Link>
            </Button>
          </div>

          <p className="landing-small mt-6 text-muted-foreground">
            Need help?{" "}
            <Link href="/support" className="font-medium text-foreground hover:text-primary">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
