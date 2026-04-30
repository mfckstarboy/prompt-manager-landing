import type { Metadata } from "next";
import Link from "next/link";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function UpgradeSuccessPage() {
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
        <div className="w-full max-w-md rounded-[32px] border border-emerald-200 bg-emerald-50/80 px-8 py-10 text-center shadow-[0_28px_70px_-48px_rgba(15,23,42,0.24)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-7 w-7 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1
            className="mt-6 text-[36px] leading-[40px] tracking-[-0.01em] text-foreground"
            style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
          >
            {"You're now on Premium"}
          </h1>

          <p className="landing-body mt-4 text-muted-foreground">
            Your account has been upgraded. To use Premium features in the extension, open it and
            refresh your plan.
          </p>

          <ol className="mt-6 space-y-3 text-left">
            <li className="landing-small flex items-start gap-3 rounded-2xl border border-emerald-200 bg-background/70 px-4 py-3 text-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                1
              </span>
              Open ChatGPT and click the PromptTray sidebar icon.
            </li>
            <li className="landing-small flex items-start gap-3 rounded-2xl border border-emerald-200 bg-background/70 px-4 py-3 text-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                2
              </span>
              Click <strong>Refresh plan</strong> in the sidebar to activate Premium.
            </li>
          </ol>

          <div className="mt-8">
            <Button asChild className="landing-ui h-12 w-full">
              <Link href="/app">Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
