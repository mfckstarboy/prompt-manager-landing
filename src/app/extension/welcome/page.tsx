import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/landing/landing-motion";
import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { getExtensionBridgeState, withExtensionBridge } from "@/lib/auth/extension-bridge";
import { WelcomeSetupPanel } from "./welcome-setup-panel";

type ExtensionWelcomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Set Up PromptTray",
  description:
    "Start PromptTray locally or create a free account to sync prompts across your AI tools.",
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
  const extensionWarning =
    bridgeState.hasExtensionSource && !bridgeState.isExtensionFlow
      ? bridgeState.isMissingExtensionId
        ? "PromptTray could not read the extension connection details. You can still create an account, but the extension will need to reconnect."
        : "Could not verify this extension connection. Continue here, then retry from your AI tool."
      : null;

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
                  Start as a guest and save prompts locally, or create a free account to sync
                  across ChatGPT, Claude, Gemini, and Perplexity.
                </p>
              </section>
            </Reveal>

            <Reveal className="h-full" variant="soft-scale" delay={220} duration={620}>
              <WelcomeSetupPanel
                extensionWarning={extensionWarning}
                loginHref={loginHref}
                signupHref={signupHref}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
