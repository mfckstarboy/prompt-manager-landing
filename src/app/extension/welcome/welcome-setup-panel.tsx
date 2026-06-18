"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Chrome,
  ExternalLink,
  Library,
  LogIn,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const SETUP_STEPS = [
  {
    icon: ShieldCheck,
    title: "Start local or connect your account",
    description: "Use PromptTray as a guest first, then create an account when you want sync.",
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

const AI_TOOLS = [
  {
    name: "ChatGPT",
    href: "https://chatgpt.com/",
    icon: "/icons/chatgpt.svg",
  },
  {
    name: "Claude",
    href: "https://claude.ai/",
    icon: "/icons/claude.svg",
  },
  {
    name: "Gemini",
    href: "https://gemini.google.com/app",
    icon: "/logos/gemini.svg",
  },
  {
    name: "Perplexity",
    href: "https://www.perplexity.ai/",
    icon: "/icons/perplexity.svg",
  },
];

type WelcomeSetupPanelProps = {
  extensionWarning: string | null;
  loginHref: string;
  signupHref: string;
};

export function WelcomeSetupPanel({
  extensionWarning,
  loginHref,
  signupHref,
}: WelcomeSetupPanelProps) {
  const [view, setView] = useState<"setup" | "guest">("setup");

  return (
    <section className="h-full">
      <div className="flex h-full min-h-[560px] flex-col rounded-[32px] border border-border/80 bg-card/96 p-6 shadow-[0_30px_80px_-46px_rgba(15,23,42,0.32)] backdrop-blur sm:p-8 lg:min-h-[584px]">
        {extensionWarning ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-6 text-amber-800">
            {extensionWarning}
          </div>
        ) : null}

        {view === "setup" ? (
          <>
            <div className="space-y-4">
              {SETUP_STEPS.map((step, index) => {
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
                        <p className="mt-1 text-[14px] leading-5 text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3">
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

              <Button
                type="button"
                variant="secondary"
                className="landing-ui h-12 w-full gap-2 bg-slate-100 text-slate-950 hover:bg-slate-200"
                onClick={() => setView("guest")}
              >
                Continue as guest
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col">
            <button
              type="button"
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-[14px] font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
              onClick={() => setView("setup")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div>
              <h2
                id="guest-mode-title"
                className="text-[34px] leading-10 tracking-[-0.02em] text-foreground sm:text-[38px] sm:leading-[44px]"
                style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
              >
                Start locally
              </h2>
              <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
                Open an AI tool and use PromptTray without an account. Your prompts stay on
                this device until you choose to sync.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {AI_TOOLS.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-[134px] flex-col items-center justify-center gap-3 rounded-[22px] border border-border/80 bg-background/85 px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white bg-white shadow-[0_12px_26px_-18px_rgba(15,23,42,0.5)]">
                    <Image src={tool.icon} alt="" width={28} height={28} className="object-contain" />
                  </span>
                  <span className="text-[13px] font-semibold leading-4 text-slate-800">
                    {tool.name}
                  </span>
                </a>
              ))}
            </div>

            <p className="mt-7 flex items-center gap-1.5 text-[12px] leading-5 text-muted-foreground">
              <ExternalLink className="h-3.5 w-3.5" />
              You can create an account later from the extension settings.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
