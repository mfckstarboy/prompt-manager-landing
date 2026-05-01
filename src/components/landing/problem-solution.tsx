import { Check, X } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";

const problems = [
  "Rewriting the same prompts from memory, every time",
  "Great prompts lost forever in chat history",
  "Copy-pasting from scattered notes and documents",
  "No organization across different AI tools",
];

const solutions = [
  "Entire prompt library, one click away",
  "Permanent library synced across all your devices",
  "Insert any prompt directly into any AI tool",
  "Search across categories and prompts in milliseconds",
];

export function ProblemSolution() {
  return (
    <section className="bg-muted/30 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4 text-balance">
            You&apos;re losing time to prompts you&apos;ve already written
          </h2>
          <p className="landing-body mx-auto max-w-2xl text-muted-foreground md:max-w-3xl">
            AI power users waste hours every week recreating prompts from memory. PromptTray fixes that permanently.
          </p>
        </Reveal>

        <RevealGroup className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2" stagger={110}>
          <RevealItem index={0}>
            <div className="rounded-2xl border border-border bg-card p-8 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_22px_40px_-30px_rgba(15,23,42,0.3)]">
              <div className="landing-label mb-6 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-red-600">
                <X className="h-4 w-4" />
                Without PromptTray
              </div>
              <ul className="space-y-4">
                {problems.map((problem) => (
                  <li key={problem} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <X className="h-3 w-3 text-red-500" />
                    </div>
                    <span className="landing-body text-muted-foreground">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealItem>

          <RevealItem index={1}>
            <div className="rounded-2xl border border-border bg-card p-8 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_22px_40px_-30px_rgba(15,23,42,0.3)]">
              <div className="landing-label mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                <Check className="h-4 w-4" />
                With PromptTray
              </div>
              <ul className="space-y-4">
                {solutions.map((solution) => (
                  <li key={solution} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span className="landing-body">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
