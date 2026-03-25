import { Code, Megaphone, Palette } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";

const useCases = [
  {
    icon: Palette,
    role: "Designers",
    quote: "I keep all my AI workflows in one place instead of rewriting prompts every time.",
    prompts: [
      "Reusing the same prompts across multiple design iterations (Midjourney, UI ideas, moodboards)",
      "Quickly testing variations without rebuilding prompts from scratch",
      "Keeping research, UX, and visual prompts organized by project",
    ],
  },
  {
    icon: Code,
    role: "Developers",
    quote: "I don’t waste time rewriting the same prompts for debugging and code tasks.",
    prompts: [
      "Reusing prompts for debugging, code review, and documentation",
      "Switching between projects without losing context",
      "Keeping structured prompts for common dev tasks (tests, refactoring, explanations)",
    ],
  },
  {
    icon: Megaphone,
    role: "Marketers",
    quote: "My entire content workflow runs faster because I reuse what already works.",
    prompts: [
      "Reusing high-performing prompts for ads, emails, and social content",
      "Scaling content production without rewriting briefs",
      "Keeping campaign prompts organized and ready to reuse",
    ],
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4">Built for how you work</h2>
          <p className="landing-body mx-auto max-w-xl text-muted-foreground md:max-w-2xl">
            Whether you design, code, or market - PromptTray fits your workflow.
          </p>
        </Reveal>

        <RevealGroup className="grid gap-8 md:grid-cols-3" stagger={90}>
          {useCases.map((useCase, index) => (
            <RevealItem key={useCase.role} index={index}>
              <div className="rounded-2xl border border-border bg-card p-6 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_24px_40px_-30px_rgba(15,23,42,0.28)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted transition-colors duration-300">
                    <useCase.icon className="h-5 w-5" />
                  </div>
                  <span className="landing-h4">{useCase.role}</span>
                </div>

                <p className="landing-body mb-6 text-muted-foreground">
                  &ldquo;{useCase.quote}&rdquo;
                </p>

                <div className="space-y-2">
                  <p className="landing-label text-muted-foreground uppercase">
                    How they use PromptTray
                  </p>
                  {useCase.prompts.map((prompt) => (
                    <div
                      key={prompt}
                      className="landing-small flex items-start gap-3 rounded-lg bg-muted/50 px-3 py-3"
                    >
                      <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{prompt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
