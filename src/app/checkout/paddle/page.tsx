"use client";

import Script from "next/script";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
  const cadence = billing === "annual" ? "per year" : "per month";
  const renewalText =
    billing === "annual" ? "Renews annually until canceled." : "Renews monthly until canceled.";
  const billingLabel = billing === "annual" ? "Annual" : "Monthly";

  return (
    <main className="landing-page min-h-screen bg-[#fbfcfe] text-foreground">
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={initializePaddle}
        onError={() => setMessage("Checkout could not load. Please refresh the page.")}
      />

      <div className="grid min-h-screen lg:grid-cols-[0.94fr_1.06fr]">
        <section className="flex min-h-[520px] flex-col bg-[#333333] px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:px-14 xl:px-16">
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              aria-label="Back to pricing"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <PromptTrayLogo className="h-6 text-white" />
            <span className="rounded bg-[#f4c95f] px-2.5 py-1 text-xs font-semibold uppercase text-[#333333]">
              Test mode
            </span>
          </div>

          <div className="mt-12 max-w-md lg:mt-16">
            <p className="text-base font-semibold text-white/70">Subscribe to PromptTray Premium</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="font-serif text-6xl leading-none text-white sm:text-7xl">{price}</span>
              <span className="pb-2 text-sm font-semibold text-white/75">{cadence}</span>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/62">{renewalText}</p>
          </div>

          <div className="mt-12 max-w-md space-y-6 text-sm lg:mt-16">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-semibold text-white">PromptTray Premium</p>
                <p className="mt-1 text-white/58">Billed {billingLabel.toLowerCase()}</p>
              </div>
              <p className="font-semibold text-white">{price}</p>
            </div>

            <div className="border-t border-white/14 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-white/78">Subtotal</p>
                <p className="font-semibold text-white">{price}</p>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-white/58">Tax</p>
                <p className="text-white/58">Included</p>
              </div>
            </div>

            <div className="border-t border-white/14 pt-6">
              <div className="flex items-center justify-between text-base">
                <p className="font-semibold text-white">Total today</p>
                <p className="font-semibold text-white">{price}</p>
              </div>
            </div>
          </div>

          <ul className="mt-10 grid max-w-md gap-3 text-sm text-white/74">
            {[
              "Unlimited prompts and categories",
              "Variables and version history",
              "Sync across devices",
              "Priority support",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/12 text-[#d9f8df]">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto hidden pt-12 text-xs text-white/45 lg:block">
            <span>Powered by Paddle</span>
            <span className="mx-4 text-white/20">|</span>
            <Link href="/privacy" className="hover:text-white/75">
              Privacy
            </Link>
            <span className="mx-4 text-white/20">|</span>
            <Link href="/terms" className="hover:text-white/75">
              Terms
            </Link>
          </div>
        </section>

        <section className="flex items-start justify-center px-5 py-8 sm:px-8 lg:min-h-screen lg:px-12 lg:py-10 xl:px-16">
          <div className="w-full max-w-[560px]">
            <div className="mb-8 lg:hidden">
              <PromptTrayLogo className="h-6 text-foreground" />
            </div>

            <div className="mb-8">
              <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
                Secure checkout
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">{message}</p>
            </div>

            <div className="paddle-checkout-frame min-h-[620px] w-full" />

            <p className="mt-8 text-center text-xs leading-6 text-muted-foreground">
              By confirming your subscription, you authorize Paddle to charge your selected
              payment method for recurring payments according to the plan terms.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
