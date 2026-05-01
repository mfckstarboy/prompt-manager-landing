"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type VerifyState = "checking" | "confirmed" | "pending";

function isPremiumEntitlement(entitlement: {
  current_period_end: string | null;
  plan: string;
  status: string;
} | null) {
  if (!entitlement) return false;
  return (
    entitlement.plan === "premium" &&
    entitlement.status === "active" &&
    (!entitlement.current_period_end || new Date(entitlement.current_period_end) > new Date())
  );
}

export default function UpgradeSuccessPage() {
  const [verifyState, setVerifyState] = useState<VerifyState>("checking");
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    const MAX_ATTEMPTS = 10;
    let attempt = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function checkEntitlement() {
      if (cancelledRef.current) return;

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setVerifyState("pending");
          return;
        }

        const { data: entitlement } = await supabase
          .from("user_entitlements")
          .select("plan, status, current_period_end")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelledRef.current) return;

        if (isPremiumEntitlement(entitlement)) {
          setVerifyState("confirmed");
          return;
        }

        attempt++;
        if (attempt >= MAX_ATTEMPTS) {
          setVerifyState("pending");
          return;
        }

        timeoutId = setTimeout(() => void checkEntitlement(), 2000);
      } catch {
        if (!cancelledRef.current) setVerifyState("pending");
      }
    }

    void checkEntitlement();

    return () => {
      cancelledRef.current = true;
      clearTimeout(timeoutId);
    };
  }, []);

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
        {verifyState === "checking" ? (
          <div className="w-full max-w-md rounded-[32px] border border-border/80 bg-card px-8 py-10 text-center shadow-[0_28px_70px_-48px_rgba(15,23,42,0.24)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <svg
                className="h-6 w-6 animate-spin text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <h1
              className="mt-6 text-[32px] leading-[36px] tracking-[-0.01em] text-foreground"
              style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
            >
              Confirming your payment…
            </h1>
            <p className="landing-body mt-4 text-muted-foreground">
              Activating your Premium account. This only takes a moment.
            </p>
          </div>
        ) : verifyState === "confirmed" ? (
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
        ) : (
          <div className="w-full max-w-md rounded-[32px] border border-amber-200 bg-amber-50/80 px-8 py-10 text-center shadow-[0_28px_70px_-48px_rgba(15,23,42,0.24)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-7 w-7 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h1
              className="mt-6 text-[32px] leading-[36px] tracking-[-0.01em] text-foreground"
              style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
            >
              Payment received
            </h1>

            <p className="landing-body mt-4 text-muted-foreground">
              Your payment was processed but your account is still being upgraded. This can take up
              to a minute. Check your dashboard — if it still shows Free, refresh the page in a
              moment.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Button asChild className="landing-ui h-12 w-full">
                <Link href="/app">Go to dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="landing-ui h-12 w-full">
                <Link href="/support">Contact support</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
