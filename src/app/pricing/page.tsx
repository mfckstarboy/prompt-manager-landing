import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { createClient } from "@/lib/supabase/server";

import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="landing-page min-h-screen bg-[#f6f7fb] text-foreground">
      <div className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
            <PromptTrayLogo className="h-6 text-foreground" />
          </Link>
          <Link
            href="/app"
            className="landing-small font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-10 text-center">
          <p className="landing-label text-muted-foreground">Pricing</p>
          <h1
            className="mt-4 text-[44px] leading-[46px] tracking-[-0.01em] text-foreground md:text-[58px] md:leading-[60px]"
            style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
          >
            Simple, honest pricing
          </h1>
          <p className="landing-body mt-4 text-muted-foreground">
            Start free. Upgrade when your prompt library grows.
          </p>
        </div>

        <PricingContent />
      </div>
    </main>
  );
}
