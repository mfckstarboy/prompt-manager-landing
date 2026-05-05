"use client";

import Script from "next/script";
import { Check } from "lucide-react";
import { useState } from "react";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";

declare global {
  interface Window {
    Paddle?: {
      Environment: {
        set: (environment: "sandbox" | "production") => void;
      };
      Checkout: {
        open: (options: { transactionId: string }) => void;
      };
      Initialize: (options: {
        token: string;
        checkout?: {
          settings?: {
            displayMode?: "overlay" | "inline";
            frameInitialHeight?: string;
            frameStyle?: string;
            frameTarget?: string;
            locale?: string;
            showAddDiscounts?: boolean;
            showAddTaxId?: boolean;
            successUrl?: string;
            theme?: "light" | "dark";
          };
        };
      }) => void;
    };
  }
}

export default function PaddleCheckoutPage() {
  const [message, setMessage] = useState("Opening secure checkout...");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  function initializePaddle() {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const searchParams = new URLSearchParams(window.location.search);
    const transactionId = searchParams.get("_ptxn");
    setBilling(searchParams.get("billing") === "annual" ? "annual" : "monthly");

    if (!token) {
      setMessage("Checkout is not configured.");
      return;
    }

    if (!window.Paddle) {
      setMessage("Checkout could not load. Please refresh the page.");
      return;
    }

    if (!transactionId) {
      setMessage("Checkout link is missing a Paddle transaction.");
      return;
    }

    window.Paddle.Environment.set("sandbox");
    window.Paddle.Initialize({
      token,
      checkout: {
        settings: {
          displayMode: "inline",
          frameInitialHeight: "560",
          frameStyle: "width: 100%; min-width: 312px; background-color: transparent; border: none;",
          frameTarget: "paddle-checkout-frame",
          locale: "en",
          showAddDiscounts: false,
          showAddTaxId: false,
          theme: "light",
          successUrl: `${window.location.origin}/upgrade/success`,
        },
      },
    });
    window.Paddle.Checkout.open({ transactionId });
    setMessage("Secure payment form loaded below.");
  }

  const price = billing === "annual" ? "$48" : "$5";
  const cadence = billing === "annual" ? "/ year" : "/ month";

  return (
    <main className="landing-page flex min-h-screen flex-col bg-[#f6f7fb] text-foreground">
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={initializePaddle}
        onError={() => setMessage("Checkout could not load. Please refresh the page.")}
      />

      <div className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <PromptTrayLogo className="h-6 text-foreground" />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-6 py-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:py-14">
        <section className="rounded-[28px] border border-border/80 bg-background p-7 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.28)] sm:p-9">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            PromptTray Premium
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Finish your upgrade
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Unlimited prompts, categories, variables, version history, and priority support.
          </p>

          <div className="mt-8 rounded-2xl bg-[#f7f4ef] p-5">
            <div className="flex items-end gap-2">
              <span className="font-serif text-5xl text-foreground">{price}</span>
              <span className="pb-2 text-muted-foreground">{cadence}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Tax is included where Paddle is required to collect it.
            </p>
          </div>

          <ul className="mt-8 space-y-4 text-sm text-foreground">
            {[
              "Unlimited prompts and categories",
              "Variables in prompts",
              "Version history",
              "Sync across devices",
              "Priority support",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d9f8df] text-[#147a35]">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[28px] border border-border/80 bg-background p-3 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.28)] sm:p-5">
          <div className="border-b border-border/80 px-3 py-4 sm:px-4">
            <h2 className="text-lg font-semibold text-foreground">Secure checkout</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          <div className="paddle-checkout-frame min-h-[560px] w-full" />
        </section>
      </div>
    </main>
  );
}
