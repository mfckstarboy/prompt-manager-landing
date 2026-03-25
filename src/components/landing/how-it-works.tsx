import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";

const steps = [
  {
    number: "01",
    title: "Save",
    description: "Click the PromptTray button to save any prompt you write.",
  },
  {
    number: "02",
    title: "Organize",
    description: "Add categories and tags to keep everything findable.",
  },
  {
    number: "03",
    title: "Reuse",
    description: "Insert any saved prompt with one click. Instant.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-secondary px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4">How it works</h2>
          <p className="landing-body mx-auto max-w-xl text-muted-foreground md:max-w-2xl">
            Three simple steps. That&apos;s it.
          </p>
        </Reveal>

        <RevealGroup className="grid gap-8 md:grid-cols-3" stagger={90}>
          {steps.map((step, index) => (
            <RevealItem key={step.number} index={index}>
              <div className="relative flex min-h-[280px] flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_24px_38px_-30px_rgba(15,23,42,0.28)]">
                <div className="mb-8 text-7xl font-semibold tracking-[-0.06em] text-primary/18 md:text-8xl">
                  {step.number}
                </div>
                <h3 className="landing-h3 mb-4">{step.title}</h3>
                <p className="landing-body max-w-[18rem] text-muted-foreground">{step.description}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
