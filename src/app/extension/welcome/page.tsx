import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
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
    "Create your free PromptTray account and start saving prompts across your AI tools.",
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
      title: "Create or connect your account",
      description: "A free account keeps your prompts synced across your AI workflow.",
    },
    {
      icon: Chrome,
      title: "Open your AI tool",
      description: "PromptTray works inside ChatGPT, Claude, Gemini, and Perplexity.",
    },
    {
      icon: Library,
      title: "Save your first prompt",
      description: "Use the sidebar to start building your prompt library.",
    },
  ];

  return (
    <main className="landing-page relative min-h-screen overflow-hidden bg-[#fbfcfe]">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_34%),linear-gradient(180deg,_#ffffff,_#f8fafc)]" />
      <div className="absolute left-1/2 top-24 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-y-0 left-0 -z-10 hidden w-1/2 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_52%)] lg:block" />

      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10 sm:px-8 lg:px-10">
        <div className="w-full">
          <Reveal className="mb-8 text-center" variant="fade" delay={120}>
            <Link href="/" className="inline-flex transition-opacity duration-200 hover:opacity-80">
              <PromptTrayLogo className="h-6 text-foreground" />
            </Link>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
            <Reveal className="h-full" variant="soft-scale" delay={160} duration={620}>
              <section className="flex h-full flex-col justify-center rounded-[34px] border border-border/80 bg-card/92 px-8 py-10 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.28)] backdrop-blur lg:px-10 lg:py-12">
                <h1
                  className="text-[38px] leading-[42px] tracking-[-0.02em] text-foreground sm:text-[46px] sm:leading-[50px] lg:text-[52px] lg:leading-[56px]"
                  style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                >
                  Your prompt library, connected everywhere.
                </h1>
                <p className="mt-5 text-[17px] leading-7 text-muted-foreground">
                  Create a free account once to sync your prompts across ChatGPT, Claude,
                  Gemini, and Perplexity.
                </p>
              </section>
            </Reveal>

            <Reveal className="h-full" variant="soft-scale" delay={220} duration={620}>
              <section className="h-full">
                <div className="flex h-full flex-col rounded-[32px] border border-border/80 bg-card/96 p-6 shadow-[0_30px_80px_-46px_rgba(15,23,42,0.32)] backdrop-blur sm:p-8">
                  {bridgeState.hasExtensionSource && !bridgeState.isExtensionFlow ? (
                    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-6 text-amber-800">
                      {bridgeState.isMissingExtensionId
                        ? "PromptTray could not read the extension connection details. You can still create an account, but the extension will need to reconnect."
                        : "Could not verify this extension connection. Continue here, then retry from your AI tool."}
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
                              <p className="text-[17px] leading-6 font-medium text-foreground">
                                {index + 1}. {step.title}
                              </p>
                              <p className="mt-1 text-[14px] leading-5 text-muted-foreground">{step.description}</p>
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
