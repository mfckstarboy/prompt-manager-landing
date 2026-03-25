import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  FolderOpen,
  LayoutGrid,
  Library,
  Plus,
  Puzzle,
  RefreshCw,
} from "lucide-react";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";

const extensionStatus = {
  browser: "Chrome",
  connected: true,
  installed: true,
  lastSync: "2 min ago",
};

const promptsOverview = {
  categories: 6,
  recentPrompt: "Homepage UX review assistant",
  totalPrompts: 28,
};

const quickActions = [
  {
    description: "Save a fresh prompt to your account.",
    icon: Plus,
    title: "Add new prompt",
  },
  {
    description: "Browse and reuse your saved prompts.",
    icon: Library,
    title: "Open prompts library",
  },
  {
    description: "Launch PromptTray inside Chrome.",
    icon: Puzzle,
    title: "Open extension",
  },
];

function StatusIndicator({ active }: { active: boolean }) {
  return (
    <span
      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
        active ? "bg-emerald-500" : "bg-muted-foreground/40"
      }`}
    />
  );
}

export default function DashboardPage() {
  return (
    <main className="landing-page min-h-screen bg-[#f6f7fb] text-foreground">
      <div className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
            <PromptTrayLogo className="h-6 text-foreground" />
          </Link>

          <nav className="flex items-center gap-3">
            <span className="landing-nav rounded-full bg-accent px-4 py-2 text-foreground">
              Dashboard
            </span>
            <Button variant="ghost" size="sm" className="landing-nav">
              Log out
            </Button>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <section className="rounded-[32px] border border-border/80 bg-card px-6 py-8 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.24)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="landing-label text-muted-foreground">Account overview</p>
              <h1
                className="mt-4 text-[44px] leading-[46px] tracking-[-0.01em] text-foreground md:text-[58px] md:leading-[60px]"
                style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
              >
                Welcome back
              </h1>
              <p className="landing-body mt-4 max-w-xl text-muted-foreground md:text-lg">
                Your prompts are synced with your account.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="landing-ui h-12 gap-2 px-6">
                Open Extension
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              {!extensionStatus.installed ? (
                <Button variant="outline" className="landing-ui h-12 px-6">
                  Install Extension
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    className="text-[30px] leading-[34px] tracking-[-0.01em] text-foreground"
                    style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                  >
                    Extension status
                  </h2>
                  <p className="landing-body mt-2 text-muted-foreground">
                    Current connection between your account and the Chrome extension.
                  </p>
                </div>
                <div className="rounded-full bg-accent p-3 text-primary">
                  <RefreshCw className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background px-4 py-4">
                  <div className="flex items-start gap-3">
                    <StatusIndicator active={extensionStatus.connected} />
                    <div>
                      <p className="landing-label text-muted-foreground">Status</p>
                      <p className="landing-h4 mt-1">
                        {extensionStatus.connected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-4">
                  <div className="flex items-start gap-3">
                    <StatusIndicator active={extensionStatus.installed} />
                    <div>
                      <p className="landing-label text-muted-foreground">Extension</p>
                      <p className="landing-h4 mt-1">
                        {extensionStatus.installed ? "Installed" : "Not installed"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-4">
                  <p className="landing-label text-muted-foreground">Last sync</p>
                  <p className="landing-h4 mt-1">{extensionStatus.lastSync}</p>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-4">
                  <p className="landing-label text-muted-foreground">Browser</p>
                  <p className="landing-h4 mt-1">{extensionStatus.browser}</p>
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
                    A quick snapshot of what is already saved in your account.
                  </p>
                </div>
                <div className="rounded-full bg-secondary p-3 text-foreground">
                  <FolderOpen className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[0.9fr_0.9fr_1.2fr]">
                <div className="rounded-2xl border border-border bg-background px-4 py-5">
                  <p className="landing-label text-muted-foreground">Total prompts</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                    {promptsOverview.totalPrompts}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-5">
                  <p className="landing-label text-muted-foreground">Categories</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                    {promptsOverview.categories}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-secondary/60 px-4 py-5">
                  <p className="landing-label text-muted-foreground">Recently added</p>
                  <p className="landing-body mt-3 text-foreground">{promptsOverview.recentPrompt}</p>
                </div>
              </div>
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
                    Shortcuts for the tasks you are most likely to use.
                  </p>
                </div>
                <div className="rounded-full bg-secondary p-3 text-foreground">
                  <LayoutGrid className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    type="button"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/12 hover:shadow-[0_18px_34px_-28px_rgba(15,23,42,0.24)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-accent p-2.5 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="landing-h4 text-base">{action.title}</p>
                        <p className="landing-small mt-1 text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
                  </button>
                ))}
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
                Your prompts are safely stored in your account. You can reinstall the extension
                anytime and restore everything instantly.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
