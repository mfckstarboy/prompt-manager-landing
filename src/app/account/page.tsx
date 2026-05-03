import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CheckCircle2, CreditCard, LifeBuoy, Puzzle } from "lucide-react";

import { SubscriptionActions } from "@/app/app/subscription-actions";
import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";
import { formatDate, isPremiumActive, isPremiumCanceled, type PlanInfo } from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";

import { AccountSettingsForm } from "./account-settings-form";
import { LogoutButton } from "../app/logout-button";

const AI_SERVICES = [
  { label: "ChatGPT", href: "https://chatgpt.com/" },
  { label: "Gemini", href: "https://gemini.google.com/" },
  { label: "Claude", href: "https://claude.ai/" },
  { label: "Perplexity", href: "https://perplexity.ai/" },
] as const;

export const metadata: Metadata = {
  title: "Manage Account",
  description: "Manage your PromptTray account and sync settings.",
  robots: { index: false, follow: false },
};

export default async function AccountRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: entitlementRow } = await supabase
    .from("user_entitlements")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const planInfo: PlanInfo | null = entitlementRow
    ? {
        plan: entitlementRow.plan as PlanInfo["plan"],
        status: entitlementRow.status as PlanInfo["status"],
        periodEnd: entitlementRow.current_period_end ?? null,
      }
    : null;

  const premiumActive = planInfo ? isPremiumActive(planInfo) : false;
  const premiumCanceled = planInfo ? isPremiumCanceled(planInfo) : false;
  const isPremium = premiumActive || premiumCanceled;

  return (
    <main className="landing-page min-h-screen bg-[#f6f7fb] text-foreground">
      <div className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
            <PromptTrayLogo className="h-6 text-foreground" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="landing-nav rounded-full px-4 py-2 text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
            >
              Dashboard
            </Link>
            <span className="landing-nav rounded-full bg-accent px-4 py-2 text-foreground">
              Manage Account
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.9fr]">
          <section className="rounded-[32px] border border-border/80 bg-card px-6 py-8 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.24)] sm:px-8 sm:py-10">
            <p className="landing-label text-muted-foreground">Manage Account</p>
            <h1
              className="mt-4 text-[44px] leading-[46px] tracking-[-0.01em] text-foreground md:text-[58px] md:leading-[60px]"
              style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
            >
              Account details
            </h1>
            <p className="landing-body mt-4 max-w-2xl text-muted-foreground md:text-lg">
              Your PromptTray account keeps your prompts synced and accessible across every AI tool
              you use.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-border bg-background px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accent p-2.5 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="landing-label text-muted-foreground">Connection</p>
                    <p className="landing-h4 mt-1 text-base text-foreground">Account connected</p>
                    <p className="landing-small mt-2 text-muted-foreground">
                      PromptTray is ready inside ChatGPT, Claude, Gemini, Perplexity and more once
                      the extension is installed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accent p-2.5 text-primary">
                    <Puzzle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="landing-label text-muted-foreground">Extension</p>
                    <p className="landing-h4 mt-1 text-base text-foreground">
                      Use PromptTray across your AI tools
                    </p>
                    <p className="landing-small mt-2 text-muted-foreground">
                      Save, organize, and insert prompts from the sidebar while this page stays
                      focused on your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <AccountSettingsForm initialEmail={user.email ?? ""} />
          </section>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)]">
              <h2
                className="text-[30px] leading-[34px] tracking-[-0.01em] text-foreground"
                style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
              >
                Quick actions
              </h2>
              <p className="landing-body mt-2 text-muted-foreground">
                Jump straight into any supported AI tool.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2">
                {AI_SERVICES.map((service) => (
                  <Button
                    key={service.href}
                    asChild
                    variant="outline"
                    className="landing-ui h-11 gap-1.5 px-4 text-sm"
                  >
                    <a href={service.href} target="_blank" rel="noreferrer">
                      {service.label}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                ))}
              </div>

              <div className="mt-3">
                <Button asChild variant="ghost" className="landing-ui h-11 w-full gap-2 px-5">
                  <Link href="/support">
                    Help
                    <LifeBuoy className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>

            {/* Subscription section */}
            <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)]">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-accent p-2.5 text-primary">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="landing-label text-muted-foreground">Subscription</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="landing-h4 text-base text-foreground">
                      {isPremium ? "Premium" : "Free plan"}
                    </p>
                    {premiumCanceled && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Canceling
                      </span>
                    )}
                  </div>
                  {planInfo?.periodEnd && isPremium && (
                    <p className="landing-small mt-1 text-muted-foreground">
                      {premiumActive
                        ? `Renews ${formatDate(planInfo.periodEnd)}`
                        : `Access until ${formatDate(planInfo.periodEnd)}`}
                    </p>
                  )}
                  {!isPremium && (
                    <p className="landing-small mt-1 text-muted-foreground">
                      30 prompts · 5 categories
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                {planInfo && isPremium ? (
                  <SubscriptionActions planInfo={planInfo} />
                ) : (
                  <Button asChild className="landing-ui h-10 w-full">
                    <Link href="/pricing">Upgrade to Premium</Link>
                  </Button>
                )}
              </div>
            </section>

            <section className="rounded-[28px] bg-foreground p-6 text-background shadow-[0_28px_70px_-42px_rgba(15,23,42,0.34)]">
              <h2
                className="text-[30px] leading-[34px] tracking-[-0.01em]"
                style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
              >
                Log out
              </h2>
              <p className="landing-body mt-4 text-background/75">
                Signing out disconnects this browser session. Your synced prompts stay attached to
                your PromptTray account.
              </p>
              <div className="mt-6">
                <LogoutButton
                  className="h-11 border-red-200 bg-transparent px-5 text-red-600 shadow-none hover:bg-red-50 hover:text-red-700 hover:shadow-none"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
