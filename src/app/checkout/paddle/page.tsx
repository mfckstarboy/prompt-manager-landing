"use client";

import Script from "next/script";
import { useState } from "react";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";

declare global {
  interface Window {
    Paddle?: {
      Environment: {
        set: (environment: "sandbox" | "production") => void;
      };
      Initialize: (options: {
        token: string;
        checkout?: {
          settings?: {
            displayMode?: "overlay" | "inline";
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

  function initializePaddle() {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

    if (!token) {
      setMessage("Checkout is not configured.");
      return;
    }

    if (!window.Paddle) {
      setMessage("Checkout could not load. Please refresh the page.");
      return;
    }

    window.Paddle.Environment.set("sandbox");
    window.Paddle.Initialize({
      token,
      checkout: {
        settings: {
          displayMode: "overlay",
          locale: "en",
          showAddDiscounts: false,
          showAddTaxId: false,
          theme: "light",
          successUrl: `${window.location.origin}/upgrade/success`,
        },
      },
    });
  }

  return (
    <main className="landing-page flex min-h-screen flex-col bg-[#f6f7fb] text-foreground">
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={initializePaddle}
        onError={() => setMessage("Checkout could not load. Please refresh the page.")}
      />

      <div className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center px-6 py-4">
          <PromptTrayLogo className="h-6 text-foreground" />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-[32px] border border-border/80 bg-card px-8 py-10 text-center shadow-[0_28px_70px_-48px_rgba(15,23,42,0.24)]">
          <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          <h1 className="font-serif text-3xl text-foreground">Checkout</h1>
          <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </main>
  );
}
