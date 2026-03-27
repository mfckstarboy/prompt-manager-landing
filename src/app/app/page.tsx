import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  FolderOpen,
  LayoutGrid,
  Puzzle,
  ShieldCheck,
} from "lucide-react";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { LogoutButton } from "./logout-button";

type CategoryRow = {
  id: string;
  name: string;
};

type PromptRow = {
  category: CategoryRow | null;
  content: string;
  created_at: string;
  id: string;
  title: string;
};

type PromptQueryRow = {
  category: CategoryRow[] | null;
  content: string;
  created_at: string;
  id: string;
  title: string;
};

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

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: categories, error: categoriesError }, { data: prompts, error: promptsError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
      supabase
        .from("prompts")
        .select(
          "id, title, content, created_at, category:categories!prompts_category_id_fkey(id, name)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  if (promptsError) {
    throw new Error(promptsError.message);
  }

  const safeCategories = (categories ?? []) as CategoryRow[];
  const safePrompts = ((prompts ?? []) as PromptQueryRow[]).map((prompt) => ({
    ...prompt,
    category: prompt.category?.[0] ?? null,
  })) satisfies PromptRow[];
  const hasPrompts = safePrompts.length > 0;
  const totalPrompts = safePrompts.length;
  const totalCategories = safeCategories.length;
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
                  Your prompts are saved through the Chrome extension and stay linked to{" "}
                  {user.email ?? "your account"}.
                </p>
                <p className="landing-small mt-3 text-muted-foreground">
                  Use this dashboard to check sync status, review your prompt library, and keep
                  your account in view.
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
                    <a href="#extension-setup">Install Extension</a>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="landing-ui h-12 px-6">
                    <a href="#prompts-overview">View prompt library</a>
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
                      The website is your account hub. Prompts are created and saved from the
                      extension while you work in ChatGPT.
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
                    <p className="landing-label text-muted-foreground">Browser</p>
                    <p className="landing-h4 mt-1">Chrome</p>
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
                      A quick read-only snapshot of the prompts already attached to your account.
                    </p>
                  </div>
                  <div className="rounded-full bg-secondary p-3 text-foreground">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[0.9fr_0.9fr_1.25fr]">
                  <div className="rounded-2xl border border-border bg-background px-4 py-5">
                    <p className="landing-label text-muted-foreground">Total prompts</p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                      {totalPrompts}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background px-4 py-5">
                    <p className="landing-label text-muted-foreground">Categories</p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                      {totalCategories}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-secondary/60 px-4 py-5">
                    <p className="landing-label text-muted-foreground">Most recent</p>
                    <p className="landing-body mt-3 text-foreground">
                      {recentPrompt ? recentPrompt.title : "No prompts saved yet"}
                    </p>
                  </div>
                </div>

                {!hasPrompts ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-border bg-background px-5 py-6">
                    <h3 className="landing-h4 text-base text-foreground">No synced prompts yet</h3>
                    <p className="landing-body mt-2 max-w-2xl text-muted-foreground">
                      Prompts are created and saved inside the Chrome extension. Once you save your
                      first prompt there, your account overview will update automatically here.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Button asChild className="landing-ui h-11 gap-2 px-5">
                        <a href="https://chatgpt.com/" target="_blank" rel="noreferrer">
                          Open Extension
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="landing-ui h-11 px-5">
                        <a href="#extension-setup">Install Extension</a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-border bg-background px-5 py-5">
                    <p className="landing-label text-muted-foreground">Latest sync preview</p>
                    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
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
                      Shortcuts for the main things you will do from the account side.
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

                  <a
                    href="#prompts-overview"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/12 hover:shadow-[0_18px_34px_-28px_rgba(15,23,42,0.24)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-accent p-2.5 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                        <FolderOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="landing-h4 text-base">View prompt library</p>
                        <p className="landing-small mt-1 text-muted-foreground">
                          Review your saved prompts and categories without editing them here.
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
                  </a>

                  <Link
                    href="/support"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/12 hover:shadow-[0_18px_34px_-28px_rgba(15,23,42,0.24)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-accent p-2.5 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="landing-h4 text-base">Manage account</p>
                        <p className="landing-small mt-1 text-muted-foreground">
                          Get help with access, setup, and account questions.
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
                  Saved prompts stay connected to your account. Reinstalling the extension does not
                  remove what is already stored in PromptTray.
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
                      PromptTray runs inside ChatGPT. Install the Chrome extension to save new
                      prompts and have them appear in your account overview.
                    </p>
                  </div>
                  <div className="rounded-full bg-accent p-3 text-primary">
                    <Download className="h-5 w-5" />
                  </div>
                </div>

                <ol className="landing-body mt-6 grid gap-3 text-muted-foreground">
                  <li className="rounded-2xl border border-border bg-background px-4 py-3">
                    Open <span className="font-medium text-foreground">chrome://extensions</span>.
                  </li>
                  <li className="rounded-2xl border border-border bg-background px-4 py-3">
                    Enable <span className="font-medium text-foreground">Developer mode</span>.
                  </li>
                  <li className="rounded-2xl border border-border bg-background px-4 py-3">
                    Load the PromptTray extension and open ChatGPT to start saving prompts.
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
