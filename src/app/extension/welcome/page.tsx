import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Chrome,
  Library,
  LogIn,
  ShieldCheck,
} from "lucide-react";

import { Reveal } from "@/components/landing/landing-motion";
import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";
import { getExtensionBridgeState, withExtensionBridge } from "@/lib/auth/extension-bridge";

type ExtensionWelcomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Set Up PromptTray",
  description:
    "Finish setting up PromptTray after installing the Chrome extension so you can connect your account and start saving prompts inside ChatGPT.",
};

function getSearchParam(
  value: string | string[] | undefined,
) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function ExtensionWelcomePage({
  searchParams,
}: ExtensionWelcomePageProps) {
  const resolvedSearchParams = await searchParams;
  const bridgeState = getExtensionBridgeState({
    get(name: string) {
      return getSearchParam(resolvedSearchParams[name]);
    },
  });

  const signupHref = withExtensionBridge("/signup", bridgeState.extensionId);
  const loginHref = withExtensionBridge("/login", bridgeState.extensionId);
  const setupSteps = [
    {
      icon: ShieldCheck,
      title: "Connect your account",
      description: "Use a free PromptTray account so your prompt library stays linked to you.",
    },
    {
      icon: Chrome,
      title: "Return to ChatGPT",
      description:
        "PromptTray lives inside ChatGPT, so that is where you will open the sidebar and manage prompts.",
    },
    {
      icon: Library,
      title: "Save your first prompt",
      description: "Open PromptTray in ChatGPT and start building your prompt library right away.",
    },
  ];
  const setupBenefits = [
    "Your prompt library stays linked to you",
    "Works inside the ChatGPT workflow you already use",
    "One quick setup, then PromptTray is ready whenever you need it",
  ];

  return (
    <main className="landing-page relative min-h-screen overflow-hidden bg-[#fbfcfe]">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_34%),linear-gradient(180deg,_#ffffff,_#f8fafc)]" />
      <div className="absolute left-1/2 top-24 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-y-0 left-0 -z-10 hidden w-1/2 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_52%)] lg:block" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 sm:px-8 lg:px-10">
        <div className="w-full">
          <Reveal className="mb-8 text-center" variant="fade" delay={120}>
            <Link href="/" className="inline-flex transition-opacity duration-200 hover:opacity-80">
              <PromptTrayLogo className="h-6 text-foreground" />
            </Link>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
            <Reveal className="h-full" variant="soft-scale" delay={160} duration={620}>
              <section className="flex h-full flex-col rounded-[34px] border border-border/80 bg-card/92 px-6 py-7 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.28)] backdrop-blur sm:px-8 sm:py-9 lg:min-h-[640px] lg:px-10 lg:py-10">
                <div className="max-w-xl">
                  <h1
                    className="text-[40px] leading-[44px] tracking-[-0.02em] text-foreground sm:text-[50px] sm:leading-[54px] lg:text-[56px] lg:leading-[58px]"
                    style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                  >
                    Set up PromptTray in under a minute.
                  </h1>
                  <p className="mt-5 max-w-lg text-[17px] leading-8 text-muted-foreground sm:text-[18px]">
                    {bridgeState.isExtensionFlow
                      ? "Connect your account once, then return to ChatGPT and PromptTray will be ready inside the workflow you already use."
                      : "Create your free account or sign in to connect PromptTray, then open ChatGPT to start building your prompt library."}
                  </p>
                </div>

                <div className="mt-10 flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {setupBenefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)]"
                      >
                        <div className="mb-3 inline-flex rounded-full bg-primary/10 p-2 text-primary">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <p className="text-[15px] leading-6 text-foreground">{benefit}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.98))] p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Chrome className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[20px] leading-7 font-medium text-foreground">
                          PromptTray does the website step once, then lives in ChatGPT.
                        </p>
                        <p className="mt-3 max-w-lg text-[15px] leading-6 text-muted-foreground">
                          This setup page gives you a clean place to create or connect your account. After that, PromptTray takes you back to where the product actually works: inside ChatGPT.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>

            <Reveal className="h-full" variant="soft-scale" delay={220} duration={620}>
              <section className="h-full">
                <div className="flex h-full flex-col rounded-[32px] border border-border/80 bg-card/96 p-6 shadow-[0_30px_80px_-46px_rgba(15,23,42,0.32)] backdrop-blur sm:p-8">
                  {bridgeState.hasExtensionSource && !bridgeState.isExtensionFlow ? (
                    <div className="mt-1 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-6 text-amber-800">
                      {bridgeState.isMissingExtensionId
                        ? "PromptTray could not read the extension connection details. You can still create an account here, but the Chrome extension will need to start the connection again."
                        : "PromptTray could not verify this extension connection. You can still continue on the website, then retry the extension connection from ChatGPT."}
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    {setupSteps.map((step, index) => {
                      const Icon = step.icon;

                      return (
                        <div
                          key={step.title}
                          className="rounded-[24px] border border-border/70 bg-background/85 px-4 py-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.24)]"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-[18px] leading-7 font-medium text-foreground">
                                {index + 1}. {step.title}
                              </p>
                              <p className="mt-2 text-[15px] leading-6 text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 lg:mt-auto">
                    <Button asChild className="landing-ui h-12 w-full gap-2">
                      <Link href={signupHref}>
                        Create free account
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button asChild variant="outline" className="landing-ui h-12 w-full gap-2">
                      <Link href={loginHref}>
                        <LogIn className="h-4 w-4" />
                        I already have an account
                      </Link>
                    </Button>

                    <Button asChild variant="ghost" className="landing-ui h-11 w-full">
                      <a href="https://chatgpt.com/" target="_blank" rel="noreferrer">
                        Open ChatGPT
                      </a>
                    </Button>
                  </div>
                </div>
              </section>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
