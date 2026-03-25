import { Check, X } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";

const problems = [
  "Rewriting the same prompts over and over",
  "Losing great prompts in chat history",
  "Copy-pasting from random documents",
  "No organization for different use cases",
];

const solutions = [
  "One-click access to all your prompts",
  "Permanent library synced across devices",
  "Insert directly into any AI tool",
  "Categories and tags for instant search",
];

export function ProblemSolution() {
  return (
    <section className="bg-muted/30 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4 text-balance">
            Your workflow is broken
          </h2>
          <p className="landing-body mx-auto max-w-2xl text-muted-foreground md:max-w-3xl">
            Every day, you waste time recreating prompts you already wrote. PromptTray fixes that.
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
