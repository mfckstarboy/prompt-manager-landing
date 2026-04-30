import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  LayoutGrid,
  LifeBuoy,
  Puzzle,
  Sparkles,
  UserRound,
} from "lucide-react";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/chrome-web-store";
import { createClient } from "@/lib/supabase/server";

import { LogoutButton } from "./logout-button";

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

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
        active ? "bg-emerald-500" : "bg-muted-foreground/35"
      }`}
    />
  );
}

function getDashboardPlan(entitlement: EntitlementRow | null) {
  const isPremium =
    entitlement?.plan === "premium" &&
    entitlement?.status === "active" &&
    (!entitlement.current_period_end || new Date(entitlement.current_period_end) > new Date());

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

  const atLimit = promptCount >= FREE_PROMPT_LIMIT || categoryCount >= FREE_CATEGORY_LIMIT;
  const nearLimit =
    promptCount >= FREE_PROMPT_NEAR_LIMIT || categoryCount >= FREE_CATEGORY_NEAR_LIMIT;

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
      headline: "You're close to the Free limit",
      severity: "near" as const,
    };
  }

  return {
    body: "Premium unlocks unlimited prompts and categories when your library grows.",
    headline: "Free plan",
    severity: "normal" as const,
  };
}

function renderPromptAvatar(prompt: PromptRow) {
  if (prompt.avatar_type === "emoji" && prompt.avatar_emoji) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted text-base">
        {prompt.avatar_emoji}
      </span>
    );
  }

  if (prompt.avatar_type === "image" && prompt.avatar_image_path) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted text-[10px] font-medium text-muted-foreground">
        IMG
      </span>
    );
  }

  return null;
}

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

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  if (promptsError) {
    throw new Error(promptsError.message);
  }

  if (entitlementError) {
    throw new Error(entitlementError.message);
  }

  const safeCategories = (categories ?? []) as CategoryRow[];
  const safePrompts = ((prompts ?? []) as PromptQueryRow[]).map((prompt) => ({
    ...prompt,
    category: prompt.category?.[0] ?? null,
  })) satisfies PromptRow[];
  const hasPrompts = safePrompts.length > 0;
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
  const extensionConnected = hasPrompts;
  const extensionInstalled = hasPrompts;
  const lastSync = recentPrompt ? formatRelativeTime(recentPrompt.created_at) : "No sync yet";

  return (
    <main className="landing-page min-h-screen bg-[#f6f7fb] text-foreground">
      <div className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
            <PromptTrayLogo className="h-6 text-foreground" />
          </Link>

          <div className="flex items-center gap-3">
            <span className="landing-nav rounded-full bg-accent px-4 py-2 text-foreground">
              Dashboard
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="space-y-8">
          <section
            id="account-overview"
            className="rounded-[32px] border border-border/80 bg-card px-6 py-8 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.24)] sm:px-8 sm:py-10"
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="landing-label text-muted-foreground">Account hub</p>
                <h1
                  className="mt-4 text-[44px] leading-[46px] tracking-[-0.01em] text-foreground md:text-[58px] md:leading-[60px]"
                  style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                >
                  Welcome back
                </h1>
                <p className="landing-body mt-4 max-w-xl text-muted-foreground md:text-lg">
                  PromptTray works inside ChatGPT through the extension sidebar and stays linked to{" "}
                  {user.email ?? "your account"}.
                </p>
                <p className="landing-small mt-3 text-muted-foreground">
                  Your account is on the {planLabel} plan. Use this dashboard for sync status and
                  usage while ChatGPT stays your main workspace for prompts.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="landing-ui h-12 gap-2 px-6">
                  <a href="https://chatgpt.com/" target="_blank" rel="noreferrer">
                    Open Extension
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
                {!extensionConnected ? (
                  <Button asChild variant="outline" className="landing-ui h-12 px-6">
                    <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noreferrer">
                      Install Extension
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="landing-ui h-12 px-6">
                    <Link href="/account">Manage Account</Link>
                  </Button>
                )}
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.95fr]">
            <div className="space-y-6">
              <section
                id="prompts-overview"
                className="rounded-[28px] border border-border/80 bg-card p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className="text-[30px] leading-[34px] tracking-[-0.01em] text-foreground"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      Extension status
                    </h2>
                    <p className="landing-body mt-2 text-muted-foreground">
                      This dashboard is your account hub. Prompt creation and management happen
                      inside ChatGPT through the PromptTray sidebar.
                    </p>
                  </div>
                  <div className="rounded-full bg-accent p-3 text-primary">
                    <Puzzle className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background px-4 py-4">
                    <div className="flex items-start gap-3">
                      <StatusDot active={extensionConnected} />
                      <div>
                        <p className="landing-label text-muted-foreground">Status</p>
                        <p className="landing-h4 mt-1">
                          {extensionConnected ? "Connected" : "Not connected"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background px-4 py-4">
                    <div className="flex items-start gap-3">
                      <StatusDot active={extensionInstalled} />
                      <div>
                        <p className="landing-label text-muted-foreground">Extension</p>
                        <p className="landing-h4 mt-1">
                          {extensionInstalled ? "Installed" : "Not installed"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background px-4 py-4">
                    <p className="landing-label text-muted-foreground">Last sync</p>
                    <p className="landing-h4 mt-1">{lastSync}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background px-4 py-4">
                    <p className="landing-label text-muted-foreground">Plan</p>
                    <p className="landing-h4 mt-1">{planLabel}</p>
                    <p className="landing-small mt-1 text-muted-foreground">
                      {isPremium ? "Unlimited library" : "Free limits active"}
                    </p>
                  </div>
                </div>
              </section>

              <section
                id="plan-usage"
                className={`rounded-[28px] border p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)] ${
                  paywallState.severity === "premium"
                    ? "border-emerald-200 bg-emerald-50/80"
                    : paywallState.severity === "near" || paywallState.severity === "limit"
                      ? "border-amber-200 bg-amber-50/85"
                      : "border-border/80 bg-card"
                }`}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-background/80 p-2 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="landing-label text-muted-foreground">Plan & usage</p>
                    </div>
                    <h2
                      className="mt-4 text-[30px] leading-[34px] tracking-[-0.01em] text-foreground"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      {paywallState.headline}
                    </h2>
                    <p className="landing-body mt-2 max-w-xl text-muted-foreground">
                      {paywallState.body}
                    </p>
                  </div>

                  {!isPremium ? (
                    <Button asChild className="landing-ui h-11 shrink-0 gap-2 px-5">
                      <Link href="/pricing">
                        Upgrade
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <span className="landing-label rounded-full bg-emerald-100 px-3 py-2 text-emerald-700">
                      Premium active
                    </span>
                  )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-5">
                    <p className="landing-label text-muted-foreground">Prompt usage</p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                      {promptUsageLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-5">
                    <p className="landing-label text-muted-foreground">Category usage</p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                      {categoryUsageLabel}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className="text-[30px] leading-[34px] tracking-[-0.01em] text-foreground"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      Prompts overview
                    </h2>
                    <p className="landing-body mt-2 text-muted-foreground">
                      A read-only snapshot of the prompts already synced from your PromptTray
                      sidebar in ChatGPT.
                    </p>
                  </div>
                  <div className="rounded-full bg-secondary p-3 text-foreground">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-secondary/60 px-4 py-5">
                  <p className="landing-label text-muted-foreground">Most recent</p>
                  {recentPrompt ? (
                    <div className="mt-3 flex items-start gap-3">
                      {renderPromptAvatar(recentPrompt)}
                      <p className="landing-body min-w-0 text-foreground">{recentPrompt.title}</p>
                    </div>
                  ) : (
                    <p className="landing-body mt-3 text-foreground">No prompts saved yet</p>
                  )}
                </div>

                {!hasPrompts ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-border bg-background px-5 py-6">
                    <h3 className="landing-h4 text-base text-foreground">No synced prompts yet</h3>
                    <p className="landing-body mt-2 max-w-2xl text-muted-foreground">
                      Save your first prompt from the PromptTray sidebar in ChatGPT and your
                      account overview will update here automatically.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Button asChild className="landing-ui h-11 gap-2 px-5">
                        <a href="https://chatgpt.com/" target="_blank" rel="noreferrer">
                          Open Extension
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="landing-ui h-11 px-5">
                        <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noreferrer">
                          Install Extension
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-border bg-background px-5 py-5">
                    <p className="landing-label text-muted-foreground">Latest sync preview</p>
                    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        {recentPrompt ? renderPromptAvatar(recentPrompt) : null}
                        <div className="min-w-0">
                          <h3 className="landing-h4 text-base text-foreground">{recentPrompt?.title}</h3>
                          <p className="landing-body mt-2 max-w-2xl text-muted-foreground">
                            {recentPrompt
                              ? recentPrompt.content.length > 160
                                ? `${recentPrompt.content.slice(0, 160)}...`
                                : recentPrompt.content
                              : "No prompts saved yet"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2 md:items-end">
                        {recentPrompt?.category ? (
                          <span className="landing-label rounded-full bg-accent px-3 py-1.5 text-accent-foreground">
                            {recentPrompt.category.name}
                          </span>
                        ) : null}
                        <p className="landing-small text-muted-foreground">
                          Updated {recentPrompt ? formatRelativeTime(recentPrompt.created_at) : "Recently"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className="text-[30px] leading-[34px] tracking-[-0.01em] text-foreground"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      Quick actions
                    </h2>
                    <p className="landing-body mt-2 text-muted-foreground">
                      Shortcuts for the account side while PromptTray stays focused inside ChatGPT.
                    </p>
                  </div>
                  <div className="rounded-full bg-secondary p-3 text-foreground">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <Link
                    href="https://chatgpt.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/12 hover:shadow-[0_18px_34px_-28px_rgba(15,23,42,0.24)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-accent p-2.5 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                        <Puzzle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="landing-h4 text-base">Open extension</p>
                        <p className="landing-small mt-1 text-muted-foreground">
                          Launch ChatGPT and use PromptTray where prompts are actually created.
                        </p>
                        </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
                  </Link>

                  <Link
                    href="/account"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/12 hover:shadow-[0_18px_34px_-28px_rgba(15,23,42,0.24)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-accent p-2.5 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="landing-h4 text-base">Manage account</p>
                        <p className="landing-small mt-1 text-muted-foreground">
                          Review your account details, connection status, and sign-out settings.
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
                  </Link>

                  <Link
                    href="/support"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/12 hover:shadow-[0_18px_34px_-28px_rgba(15,23,42,0.24)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-accent p-2.5 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                        <LifeBuoy className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="landing-h4 text-base">Help</p>
                        <p className="landing-small mt-1 text-muted-foreground">
                          Get setup guidance, troubleshooting help, and support details.
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
                  </Link>
                </div>
              </section>

              <section className="rounded-[28px] bg-foreground p-6 text-background shadow-[0_28px_70px_-42px_rgba(15,23,42,0.34)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h2
                  className="mt-5 text-[30px] leading-[34px] tracking-[-0.01em]"
                  style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                >
                  Your prompts stay with you
                </h2>
                <p className="landing-body mt-4 max-w-md text-background/75">
                  Saved prompts stay connected to your account while ChatGPT remains your workspace.
                  Reinstalling the extension does not remove what is already synced to PromptTray.
                </p>
              </section>

              <section
                id="extension-setup"
                className="rounded-[28px] border border-border/80 bg-card p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className="text-[30px] leading-[34px] tracking-[-0.01em] text-foreground"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      Install extension
                    </h2>
                    <p className="landing-body mt-2 text-muted-foreground">
                      PromptTray runs inside ChatGPT. Install it from the Chrome Web Store to save
                      new prompts and have them appear in your account overview.
                    </p>
                  </div>
                  <div className="rounded-full bg-accent p-3 text-primary">
                    <Download className="h-5 w-5" />
                  </div>
                </div>

                <ol className="landing-body mt-6 grid gap-3 text-muted-foreground">
                  <li className="rounded-2xl border border-border bg-background px-4 py-3">
                    Open the{" "}
                    <a
                      href={CHROME_WEB_STORE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground underline underline-offset-4 transition-colors duration-200 hover:text-primary"
                    >
                      Chrome Web Store listing
                    </a>
                    .
                  </li>
                  <li className="rounded-2xl border border-border bg-background px-4 py-3">
                    Click <span className="font-medium text-foreground">Add to Chrome</span>.
                  </li>
                  <li className="rounded-2xl border border-border bg-background px-4 py-3">
                    Open ChatGPT and use PromptTray to start saving prompts.
                  </li>
                </ol>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
