import { Code, Megaphone, Palette } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";

const useCases = [
  {
    icon: Palette,
    role: "Designers",
    summary:
      "Save prompts for UI ideas, creative direction, moodboards, and research. Reuse them across iterations without rebuilding from scratch.",
    prompts: [
      "Reuse the same prompts across design iterations",
      "Test variations without rebuilding prompts from scratch",
      "Keep research, UX, and visual prompts organized by project",
    ],
  },
  {
    icon: Code,
    role: "Developers",
    summary:
      "Keep debugging prompts, code review prompts, test prompts, and documentation templates one click away while you work.",
    prompts: [
      "Reuse prompts for debugging, code review, and documentation",
      "Switch between projects without losing prompt context",
      "Keep repeat prompts for tests, refactoring, and explanations",
    ],
  },
  {
    icon: Megaphone,
    role: "Marketers",
    summary:
      "Reuse proven prompts for landing pages, ads, emails, briefs, and content production across campaigns.",
    prompts: [
      "Reuse high-performing prompts for ads, emails, and social content",
      "Scale content production without rewriting briefs",
      "Keep campaign prompts organized and ready to reuse",
    ],
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4">
            Built for real AI workflows
          </h2>
          <p className="landing-body mx-auto max-w-xl text-muted-foreground md:max-w-2xl">
            Whether you write, design, code, or market, PromptTray helps you reuse what works
            instead of starting over.
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

                <p className="landing-body mb-6 text-muted-foreground">{useCase.summary}</p>

                <div className="space-y-2">
                  <p className="landing-label text-muted-foreground uppercase">Common workflows</p>
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
