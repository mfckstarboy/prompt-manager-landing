import Link from "next/link";
import { redirect } from "next/navigation";

import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { createClient } from "@/lib/supabase/server";

import { LogoutButton } from "./logout-button";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="landing-page min-h-screen bg-[#f6f7fb] text-foreground">
      <div className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
            <PromptTrayLogo className="h-6 text-foreground" />
          </Link>

          <LogoutButton />
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl px-6 py-12">
        <div className="w-full rounded-[30px] border border-border/80 bg-card p-8 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.22)]">
          <h1
            className="text-[40px] leading-[44px] tracking-[-0.01em] text-foreground md:text-[48px] md:leading-[52px]"
            style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
          >
            Welcome
          </h1>

          <p className="landing-body mt-4 max-w-2xl text-muted-foreground">
            You are logged in and your PromptTray account is ready to use.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="landing-label text-muted-foreground">Signed in as</p>
              <p className="landing-body mt-3 break-all text-foreground">{user.email}</p>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/70 p-5">
              <p className="landing-label text-muted-foreground">Status</p>
              <p className="landing-body mt-3 text-foreground">
                Your account is authenticated and connected to this session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
