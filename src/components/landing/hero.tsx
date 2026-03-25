import { ArrowRight, Chrome, Search, Settings, Sparkles, X } from "lucide-react";

import { Reveal } from "@/components/landing/landing-motion";
import { PromptTrayLogo } from "@/components/landing/prompttray-logo";
import { Button } from "@/components/ui/button";

const promptList = [
  {
    category: "Marketing",
    description: "Write a high-converting hero section for a SaaS product...",
    name: "Landing page hero generator",
  },
  {
    category: "Marketing",
    description: "Generate 10 email subject lines for a product launch...",
    name: "Email subject line variants",
  },
  {
    category: "Marketing",
    description: "Create two ad copy variations for Facebook targeting...",
    name: "Ad copy A/B test",
  },
  {
    category: "Coding",
    description: "Review this code for bugs, performance issues, and style...",
    name: "Code review assistant",
  },
  {
    category: "Coding",
    description: "Explain this concept assuming senior-level knowledge...",
    name: "Explain like I'm a senior dev",
  },
  {
    category: "Coding",
    description: "Write comprehensive unit tests for the following function...",
    name: "Write unit tests",
  },
];

const categoryClassNames: Record<string, string> = {
  Coding: "bg-sky-50 text-sky-600",
  Marketing: "bg-orange-50 text-orange-600",
};

export function Hero() {
  return (
    <section className="px-6 pb-20 pt-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-16 max-w-3xl text-center" variant="fade-up" delay={160}>
          <div className="landing-label mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-accent-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Works with ChatGPT, Claude, Gemini & more
          </div>

          <h1 className="landing-h1 mb-6 text-balance">
            Stop rewriting prompts.
          </h1>

          <p className="landing-body-lg mx-auto mb-8 max-w-xl text-muted-foreground text-pretty">
            Save, organize, and instantly reuse your best prompts directly inside AI tools. Save
            once. Use forever.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="landing-ui h-12 gap-2 px-6">
              <Chrome className="h-5 w-5" />
              Add to Chrome - Free
            </Button>
            <Button asChild variant="ghost" size="lg" className="landing-ui h-12 gap-2 px-6">
              <a href="#how-it-works">
                See how it works
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </Reveal>

        <Reveal
          className="relative mx-auto w-full max-w-[894px]"
          variant="soft-scale"
          delay={260}
          duration={700}
        >
          <div className="aspect-[894/635] overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_42px_90px_-54px_rgba(15,23,42,0.32)]">
            <div className="flex items-center gap-2 border-b border-border bg-white px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex flex-1 justify-center">
                <div className="landing-label rounded-full border border-border bg-background px-4 py-1 text-muted-foreground">
                  chat.openai.com
                </div>
              </div>
            </div>

            <div className="grid h-[calc(100%-53px)] lg:grid-cols-[1fr_250px]">
              <div className="relative overflow-hidden border-b border-border bg-[#f7f7fa] lg:border-b-0 lg:border-r">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.94),_rgba(247,247,250,0.88)_42%,_rgba(232,234,239,0.95)_100%)]" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />

                <div className="relative flex h-full flex-col">
                  <div className="flex-1 px-8 py-7">
                    <div className="max-w-2xl opacity-55">
                      <div className="mb-7 space-y-3">
                        <div className="h-3 w-36 rounded-full bg-foreground/10" />
                        <div className="h-4 w-[72%] rounded-full bg-foreground/12" />
                        <div className="h-4 w-[88%] rounded-full bg-foreground/10" />
                        <div className="h-4 w-[70%] rounded-full bg-foreground/10" />
                      </div>

                      <div className="mb-9 space-y-3">
                        <div className="h-4 w-[84%] rounded-full bg-foreground/10" />
                        <div className="h-4 w-[76%] rounded-full bg-foreground/10" />
                        <div className="h-4 w-[79%] rounded-full bg-foreground/10" />
                      </div>

                      <div className="space-y-3">
                        <div className="h-4 w-[68%] rounded-full bg-foreground/10" />
                        <div className="h-4 w-[82%] rounded-full bg-foreground/10" />
                        <div className="h-4 w-[64%] rounded-full bg-foreground/10" />
                      </div>
                    </div>

                    <div className="absolute bottom-14 left-1/2 w-[calc(100%-64px)] max-w-2xl -translate-x-1/2">
                      <div className="rounded-[22px] border border-border bg-white/95 px-5 py-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
                        <div className="landing-small text-muted-foreground">Ask anything</div>
                        <div className="mt-3 flex items-center gap-3 text-muted-foreground">
                          <div className="landing-label rounded-full border border-border px-2.5 py-1">
                            Tools
                          </div>
                          <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                          <div className="landing-label">PromptTray ready</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <PromptTrayLogo className="h-5 text-foreground" />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <button
                      type="button"
                      className="rounded-full border border-border p-1.5 transition-colors duration-200 hover:bg-accent"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-1.5 transition-colors duration-200 hover:bg-accent"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search prompts"
                      className="landing-small w-full rounded-xl border border-border bg-[#f7f8fb] py-2.5 pl-8 pr-3 text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex min-w-max gap-2">
                    {["All", "Draft", "Marketing", "Coding", "Design", "Research"].map(
                      (filter, index) => (
                        <span
                          key={filter}
                          className={`landing-label whitespace-nowrap rounded-full px-2.5 py-1 ${
                            index === 0
                              ? "bg-foreground text-background"
                              : "border border-border bg-[#f7f8fb] text-muted-foreground"
                          }`}
                        >
                          {filter}
                        </span>
                      )
                    )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#f4f5f8] p-1">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="landing-label rounded-lg bg-white px-3 py-2 text-center text-foreground shadow-sm">
                        Prompts List
                      </div>
                      <div className="landing-label px-3 py-2 text-center text-muted-foreground">
                        Favorites 1
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 px-4 pb-4">
                  {promptList.map((prompt) => (
                    <div
                      key={prompt.name}
                      className="cursor-pointer rounded-2xl border border-border bg-white p-3 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/10 hover:shadow-[0_16px_28px_-24px_rgba(15,23,42,0.25)]"
                    >
                      <div
                        className={`landing-label inline-flex rounded-md px-2 py-1 ${
                          categoryClassNames[prompt.category] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {prompt.category}
                      </div>
                      <p className="landing-small mt-3 font-medium text-foreground">{prompt.name}</p>
                      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                        {prompt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-t from-muted/50 to-transparent opacity-50 blur-3xl" />
        </Reveal>
      </div>
    </section>
  );
}
