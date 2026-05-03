import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "PromptTray account dashboard and extension sync overview.",
  robots: { index: false, follow: false },
};

import {
  ChevronRight,
  CloudDownload,
  Globe,
  LayoutGrid,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { CHROME_WEB_STORE_URL } from "@/lib/chrome-web-store";
import { createClient } from "@/lib/supabase/server";

import { LogoutButton } from "./logout-button";
import { PendingPlanRedirect } from "./pending-plan-redirect";

type CategoryRow = {
  id: string;
  name: string;
};

type PromptRow = {
  avatar_emoji: string | null;
  avatar_image_path: string | null;
  avatar_type: string | null;
  category: CategoryRow | null;
  content: string;
  created_at: string;
  id: string;
  title: string;
};

type PromptQueryRow = {
  avatar_emoji: string | null;
  avatar_image_path: string | null;
  avatar_type: string | null;
  category: CategoryRow[] | null;
  content: string;
  created_at: string;
  id: string;
  title: string;
};

type EntitlementRow = {
  current_period_end: string | null;
  plan: string;
  status: string;
};

const FREE_PROMPT_LIMIT = 30;
const FREE_CATEGORY_LIMIT = 5;
const FREE_PROMPT_NEAR_LIMIT = 24;
const FREE_CATEGORY_NEAR_LIMIT = 4;

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const absMinutes = Math.abs(diffMinutes);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absMinutes < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  const absHours = Math.abs(diffHours);

  if (absHours < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

function getDashboardPlan(entitlement: EntitlementRow | null) {
  const isPremium =
    entitlement?.plan === "premium" &&
    (entitlement?.status === "active" || entitlement?.status === "canceled") &&
    (!entitlement.current_period_end ||
      new Date(entitlement.current_period_end) > new Date());

  return isPremium ? "premium" : "free";
}

function getDashboardPaywallState({
  categoryCount,
  isPremium,
  promptCount,
}: {
  categoryCount: number;
  isPremium: boolean;
  promptCount: number;
}) {
  if (isPremium) {
    return {
      body: "Unlimited prompts and categories are active on this account.",
      headline: "Premium plan",
      severity: "premium" as const,
    };
  }

  const atLimit =
    promptCount >= FREE_PROMPT_LIMIT || categoryCount >= FREE_CATEGORY_LIMIT;
  const nearLimit =
    promptCount >= FREE_PROMPT_NEAR_LIMIT ||
    categoryCount >= FREE_CATEGORY_NEAR_LIMIT;

  if (atLimit) {
    return {
      body: "Upgrade to Premium for unlimited prompts and categories.",
      headline: "Free limit reached",
      severity: "limit" as const,
    };
  }

  if (nearLimit) {
    return {
      body: "Upgrade before your prompt workflow hits the Free plan cap.",
      headline: "You're close to the limit",
      severity: "near" as const,
    };
  }

  return {
    body: "Premium unlocks unlimited prompts and categories when your library grows.",
    headline: "Free plan",
    severity: "normal" as const,
  };
}

const AI_APPS = [
  { label: "ChatGPT", href: "https://chatgpt.com/", icon: "/icons/chatgpt.svg" },
  { label: "Claude", href: "https://claude.ai/", icon: "/icons/claude.svg" },
  { label: "Gemini", href: "https://gemini.google.com/app", icon: "/icons/gemini.png" },
  { label: "Perplexity", href: "https://www.perplexity.ai/", icon: "/icons/perplexity.svg" },
] as const;

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: categories, error: categoriesError },
    { data: prompts, error: promptsError },
    { data: entitlement, error: entitlementError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("prompts")
      .select(
        "id, title, content, created_at, avatar_type, avatar_emoji, avatar_image_path, category:categories!prompts_category_id_fkey(id, name)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_entitlements")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (categoriesError) throw new Error(categoriesError.message);
  if (promptsError) throw new Error(promptsError.message);
  if (entitlementError) throw new Error(entitlementError.message);

  const safeCategories = (categories ?? []) as CategoryRow[];
  const safePrompts = ((prompts ?? []) as PromptQueryRow[]).map((prompt) => ({
    ...prompt,
    category: prompt.category?.[0] ?? null,
  })) satisfies PromptRow[];

  const totalPrompts = safePrompts.length;
  const totalCategories = safeCategories.length;
  const plan = getDashboardPlan((entitlement ?? null) as EntitlementRow | null);
  const isPremium = plan === "premium";
  const paywallState = getDashboardPaywallState({
    categoryCount: totalCategories,
    isPremium,
    promptCount: totalPrompts,
  });
  const planLabel = isPremium ? "Premium" : "Free";
  const promptUsageLabel = isPremium
    ? `${totalPrompts} / Unlimited`
    : `${totalPrompts} / ${FREE_PROMPT_LIMIT}`;
  const categoryUsageLabel = isPremium
    ? `${totalCategories} / Unlimited`
    : `${totalCategories} / ${FREE_CATEGORY_LIMIT}`;
  const recentPrompt = safePrompts[0] ?? null;
  const extensionConnected = true;
  const extensionInstalled = true;
  const lastSync = recentPrompt
    ? formatRelativeTime(recentPrompt.created_at)
    : "No sync yet";

  const emailInitial = (user.email?.[0] ?? "U").toUpperCase();

  const statusItems = [
    {
      label: "Status",
      value: extensionConnected ? "Connected" : "Not connected",
      dot: extensionConnected,
    },
    {
      label: "Extension",
      value: extensionInstalled ? "Installed" : "Not installed",
      dot: extensionInstalled,
    },
    { label: "Last sync", value: lastSync, dot: false },
    { label: "Plan", value: planLabel, dot: false },
  ] as const;

  return (
    <main className="landing-page min-h-screen bg-[#f6f7fb] text-foreground">
      <PendingPlanRedirect />

      {/* Header */}
      <header className="border-b border-[#ebecef] bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1152px] items-center justify-between px-6">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <PromptTrayLogo className="h-7 text-foreground" />
          </Link>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#cfe4f3] bg-[#e0f2fe]">
                <span className="text-[13px] font-medium tracking-[-0.076px] text-[#37759f]">
                  {emailInitial}
                </span>
              </div>
              <span className="text-[13px] font-medium tracking-[-0.076px] text-[#1d1d1f]">
                {user.email}
              </span>
            </div>

            <LogoutButton
              variant="outline"
              className="h-10 rounded-full border border-[#e6e7eb] px-4 text-[13px] font-medium text-[#1d1d1f]"
            />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-[1152px] px-6 py-14">
        <div className="flex flex-col gap-8">

          {/* Hero card */}
          <div className="flex gap-8 overflow-hidden rounded-[32px] border border-[#ebecef] bg-white p-8 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-2px_rgba(0,0,0,0.05)]">
            <div className="flex flex-1 flex-col gap-4">
              <h1
                className="text-[48px] leading-none text-black"
                style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
              >
                Welcome back
              </h1>
              <p className="text-[16px] leading-[26px] tracking-[0.034px] text-[#86868b]">
                PromptTray works inside ChatGPT, Claude, Gemini, and Perplexity
                — linked to{" "}
                <span className="text-[#3b82f6]">{user.email}</span>
              </p>
            </div>

            <div className="w-px self-stretch bg-[#ebecef]" />

            <div className="flex flex-col items-end justify-between">
              <a
                href={CHROME_WEB_STORE_URL}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center gap-2.5 rounded-full bg-[#3b82f6] px-4 text-[13px] font-medium text-white transition-colors hover:bg-blue-600"
              >
                <Globe className="size-[22px]" />
                Download Chrome Extension
              </a>

              <div className="flex items-center gap-6">
                <p className="text-right text-[16px] leading-[26px] tracking-[0.034px] text-[#86868b]">
                  Open any supported AI app to start using PromptTray:
                </p>
                <div className="flex gap-3">
                  {AI_APPS.map(({ label, href, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      title={label}
                      className="flex size-[46px] shrink-0 items-center justify-center rounded-full border border-[#e6e7eb] transition-colors hover:bg-[#f6f7fb]"
                    >
                      <img src={icon} alt={label} className="size-[28px] object-contain" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="flex gap-6">

            {/* Left column */}
            <div className="flex flex-1 flex-col gap-6">

              {/* Extension status */}
              <section className="overflow-hidden rounded-[32px] border border-[#ebecef] bg-white px-8 py-7 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex flex-1 flex-col gap-2">
                    <h2
                      className="text-[32px] leading-none text-black"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      Extension status
                    </h2>
                    <p className="text-[14px] leading-[22px] tracking-[0.034px] text-[#86868b]">
                      This dashboard is your account hub. Prompt creation and
                      management happen inside any supported AI app through the
                      PromptTray sidebar.
                    </p>
                  </div>
                  <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-[#f6f7fb]">
                    <Puzzle className="size-[26px] text-[#1d1d1f]" />
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  {statusItems.map(({ label, value, dot }) => (
                    <div
                      key={label}
                      className="flex flex-col gap-2 rounded-2xl border border-[#e6e7eb] px-4 pb-3 pt-4"
                    >
                      <p className="text-[12px] font-medium tracking-[-0.076px] text-[#86868b]">
                        {label}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-[16px] font-medium leading-[26px] tracking-[-0.076px] text-[#1d1d1f]">
                          {value}
                        </p>
                        {dot && (
                          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Plan card */}
              <section
                className={`overflow-hidden rounded-[32px] border px-8 py-7 ${
                  isPremium
                    ? "border-[#1461fc] bg-white"
                    : "border-[#ebecef] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]"
                }`}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex flex-1 flex-col gap-2">
                    <h2
                      className={`text-[32px] leading-none ${isPremium ? "text-[#1461fc]" : "text-black"}`}
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      {paywallState.headline}
                    </h2>
                    <p className="text-[14px] leading-[22px] tracking-[0.034px] text-[#86868b]">
                      {paywallState.body}
                    </p>
                  </div>
                  <div
                    className={`flex size-[46px] shrink-0 items-center justify-center rounded-full ${
                      isPremium ? "bg-[#e0f2fe]" : "bg-[#f6f7fb]"
                    }`}
                  >
                    <Sparkles className="size-[26px] text-[#1d1d1f]" />
                  </div>
                </div>

                <div className="mt-7 flex gap-3">
                  <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-[#e6e7eb] px-4 pb-3 pt-4">
                    <p className="text-[12px] font-medium tracking-[-0.076px] text-[#86868b]">
                      Prompt usage
                    </p>
                    <p className="text-[16px] font-medium leading-[26px] tracking-[-0.076px] text-[#1d1d1f]">
                      {promptUsageLabel}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-[#e6e7eb] px-4 pb-3 pt-4">
                    <p className="text-[12px] font-medium tracking-[-0.076px] text-[#86868b]">
                      Category usage
                    </p>
                    <p className="text-[16px] font-medium leading-[26px] tracking-[-0.076px] text-[#1d1d1f]">
                      {categoryUsageLabel}
                    </p>
                  </div>
                </div>

                {!isPremium && (
                  <Link
                    href="/pricing"
                    className="mt-3 flex h-10 w-full items-center justify-center rounded-full bg-[#3b82f6] text-[13px] font-medium text-white transition-colors hover:bg-blue-600"
                  >
                    Upgrade Plan
                  </Link>
                )}
              </section>

              {/* Prompts overview */}
              <section className="overflow-hidden rounded-[32px] border border-[#ebecef] bg-white px-8 py-7 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex flex-1 flex-col gap-2">
                    <h2
                      className="text-[32px] leading-none text-black"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      Prompts overview
                    </h2>
                    <p className="text-[14px] leading-[22px] tracking-[0.034px] text-[#86868b]">
                      A read-only snapshot of the prompts already synced from
                      your PromptTray sidebar across supported AI apps.
                    </p>
                  </div>
                  <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-[#f6f7fb]">
                    <LayoutGrid className="size-[26px] text-[#1d1d1f]" />
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-3">
                  <div className="flex min-h-[77px] flex-col justify-center gap-2 rounded-2xl bg-[#f6f7fb] px-4 pb-3 pt-4">
                    <p className="text-[12px] font-medium tracking-[-0.076px] text-[#86868b]">
                      Most recent
                    </p>
                    <p className="text-[16px] font-medium leading-[26px] tracking-[-0.076px] text-[#1d1d1f]">
                      {recentPrompt?.title ?? "No prompts saved yet"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 rounded-2xl border border-[#e6e7eb] px-4 pb-3 pt-4">
                    <p className="text-[12px] font-medium tracking-[-0.076px] text-[#86868b]">
                      Latest sync preview
                    </p>
                    {recentPrompt ? (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-[16px] font-medium leading-[26px] tracking-[-0.076px] text-[#1d1d1f]">
                            {recentPrompt.title}
                          </p>
                          <p className="shrink-0 text-[12px] font-medium tracking-[-0.076px] text-[#86868b]">
                            Updated {formatRelativeTime(recentPrompt.created_at)}
                          </p>
                        </div>
                        <p className="text-[14px] leading-[22px] tracking-[0.034px] text-[#86868b]">
                          {recentPrompt.content.length > 160
                            ? `${recentPrompt.content.slice(0, 160)}...`
                            : recentPrompt.content}
                        </p>
                      </>
                    ) : (
                      <p className="text-[16px] font-medium leading-[26px] tracking-[-0.076px] text-[#1d1d1f]">
                        No synced prompts yet
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Right column */}
            <div className="flex flex-1 flex-col gap-6">

              {/* Quick actions */}
              <section className="overflow-hidden rounded-[32px] border border-[#ebecef] bg-white px-8 py-7 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex flex-1 flex-col gap-2">
                    <h2
                      className="text-[32px] leading-none text-black"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      Quick actions
                    </h2>
                    <p className="text-[14px] leading-[22px] tracking-[0.034px] text-[#86868b]">
                      Open a supported AI app or manage your account.
                    </p>
                  </div>
                  <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-[#f6f7fb]">
                    <Zap className="size-[26px] text-[#1d1d1f]" />
                  </div>
                </div>

                <div className="my-7 h-px bg-[#ebecef]" />

                <div className="flex justify-center gap-2 px-8">
                  {AI_APPS.map(({ label, href, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex size-[60px] items-center justify-center rounded-full border border-[#e6e7eb] transition-colors hover:bg-[#f6f7fb]">
                        <img src={icon} alt={label} className="size-[36px] object-contain" />
                      </div>
                      <p className="text-[14px] font-medium leading-[22px] tracking-[0.034px] text-black">
                        {label}
                      </p>
                    </a>
                  ))}
                </div>

                <div className="my-7 h-px bg-[#ebecef]" />

                <Link
                  href="/account"
                  className="flex items-center gap-4 transition-opacity hover:opacity-80"
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <p className="text-[16px] font-medium leading-[26px] tracking-[0.034px] text-black">
                      Manage your account
                    </p>
                    <p className="text-[14px] leading-[22px] tracking-[0.034px] text-[#86868b]">
                      Check your account details, connection status, and
                      sign-out options.
                    </p>
                  </div>
                  <ChevronRight className="size-[22px] shrink-0 text-[#1d1d1f]" />
                </Link>

                <div className="my-7 h-px bg-[#ebecef]" />

                <Link
                  href="/support"
                  className="flex items-center gap-4 transition-opacity hover:opacity-80"
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <p className="text-[16px] font-medium leading-[26px] tracking-[0.034px] text-black">
                      Help
                    </p>
                    <p className="text-[14px] leading-[22px] tracking-[0.034px] text-[#86868b]">
                      Get setup guidance, troubleshooting help, and support
                      details.
                    </p>
                  </div>
                  <ChevronRight className="size-[22px] shrink-0 text-[#1d1d1f]" />
                </Link>
              </section>

              {/* Your prompts stay with you */}
              <section className="overflow-hidden rounded-[32px] bg-[#333] px-8 py-7 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex flex-1 flex-col gap-2">
                    <h2
                      className="text-[32px] leading-none text-white"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      Your prompts stay with you
                    </h2>
                    <p className="text-[14px] leading-[22px] tracking-[0.034px] text-[#cccccc]">
                      Saved prompts stay connected to your account across all
                      supported AI apps. Reinstalling the extension does not
                      remove what is already synced to PromptTray.
                    </p>
                  </div>
                  <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-[#474747]">
                    <ShieldCheck className="size-[26px] text-white" />
                  </div>
                </div>
              </section>

              {/* Install extension */}
              <section className="overflow-hidden rounded-[32px] border border-[#ebecef] bg-white px-8 py-7 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex flex-1 flex-col gap-2">
                    <h2
                      className="text-[32px] leading-none text-black"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      Install extension
                    </h2>
                    <p className="text-[14px] leading-[22px] tracking-[0.034px] text-[#86868b]">
                      PromptTray works with ChatGPT, Claude, Gemini, and
                      Perplexity. Get it from the Chrome Web Store to manage
                      your prompts.
                    </p>
                  </div>
                  <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-[#f6f7fb]">
                    <CloudDownload className="size-[26px] text-[#1d1d1f]" />
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-3">
                  <div className="flex flex-col gap-4 rounded-2xl border border-[#e6e7eb] p-4">
                    <div className="flex size-[22px] items-center justify-center rounded-full bg-[#1d1d1f]">
                      <span className="text-[12px] font-medium text-white">1</span>
                    </div>
                    <p className="text-[16px] font-medium leading-[26px] tracking-[-0.076px] text-[#1d1d1f]">
                      <span className="font-normal text-[#86868b]">Open the </span>
                      <a
                        href={CHROME_WEB_STORE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-solid"
                      >
                        Chrome Web Store listing.
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 rounded-2xl border border-[#e6e7eb] p-4">
                    <div className="flex size-[22px] items-center justify-center rounded-full bg-[#1d1d1f]">
                      <span className="text-[12px] font-medium text-white">2</span>
                    </div>
                    <p className="text-[16px] font-medium leading-[26px] tracking-[-0.076px] text-[#1d1d1f]">
                      <span className="font-normal text-[#86868b]">Click </span>
                      Add to Chrome{" "}
                      <span className="font-normal text-[#86868b]">
                        and login to account.
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 rounded-2xl border border-[#e6e7eb] p-4">
                    <div className="flex size-[22px] items-center justify-center rounded-full bg-[#1d1d1f]">
                      <span className="text-[12px] font-medium text-white">3</span>
                    </div>
                    <p className="font-normal text-[16px] leading-[26px] tracking-[-0.076px] text-[#86868b]">
                      Open ChatGPT, Claude, Gemini, or Perplexity and use
                      PromptTray to start saving prompts.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
