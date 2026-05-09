import {
  Braces,
  FolderOpen,
  History,
  MousePointerClick,
  Save,
  Search,
  Sparkles,
} from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";

const features = [
  {
    icon: Save,
    title: "Save prompts fast",
    description: "Save any prompt in one click while you work. No extra tabs, no messy docs.",
  },
  {
    icon: FolderOpen,
    title: "Organize your library",
    description: "Group prompts with categories and tags so everything stays easy to browse as your library grows.",
  },
  {
    icon: Search,
    title: "Find prompts instantly",
    description: "Search your full prompt library in seconds and pull up exactly what you need.",
  },
  {
    icon: MousePointerClick,
    title: "Insert anywhere",
    description: "Drop any saved prompt into ChatGPT, Claude, Gemini, or Perplexity with one click.",
  },
  {
    icon: Braces,
    title: "Use variables in prompts",
    description: "Turn repeat prompts into reusable templates. Fill in the details instead of rewriting the whole thing.",
    premium: true,
  },
  {
    icon: History,
    title: "Keep version history",
    description: "Edit with confidence. Go back to earlier versions whenever you want.",
    premium: true,
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4">Everything you need in a prompt manager</h2>
          <p className="landing-body mx-auto max-w-xl text-muted-foreground md:max-w-2xl">
            PromptTray helps you save prompts, organize them, and reuse them inside the AI tools
            you already use every day.
          </p>
        </Reveal>

        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={80}>
          {features.map((feature, index) => (
            <RevealItem key={feature.title} index={index}>
              <div className="group relative rounded-2xl border border-border bg-card p-6 transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_24px_40px_-30px_rgba(15,23,42,0.28)]">
                {feature.premium && (
                  <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    <Sparkles className="h-3 w-3" />
                    Premium
                  </span>
                )}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent transition-[background-color,transform] duration-300 ease-out group-hover:scale-[1.03] group-hover:bg-primary">
                  <feature.icon className="h-6 w-6 text-accent-foreground transition-colors duration-300 group-hover:text-primary-foreground" />
                </div>
                <h3 className="landing-h3 mb-2">{feature.title}</h3>
                <p className="landing-body text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
