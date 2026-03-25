import {
  Cloud,
  FolderOpen,
  MousePointerClick,
  PanelRight,
  Save,
  Search,
} from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/landing-motion";

const features = [
  {
    icon: Save,
    title: "Save prompts",
    description: "Capture your best prompts with one click. Never lose a working prompt again.",
  },
  {
    icon: FolderOpen,
    title: "Categories & tags",
    description: "Organize by project, topic, or any system that works for you.",
  },
  {
    icon: Search,
    title: "Instant search",
    description: "Find any prompt in milliseconds with powerful full-text search.",
  },
  {
    icon: MousePointerClick,
    title: "One-click insert",
    description: "Insert prompts directly into any AI tool with a single click.",
  },
  {
    icon: PanelRight,
    title: "Sidebar access",
    description: "Your prompts live in a clean sidebar, always within reach.",
  },
  {
    icon: Cloud,
    title: "Cloud sync",
    description: "Access your prompts from any device. Everything stays in sync.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4">Everything you need</h2>
          <p className="landing-body mx-auto max-w-xl text-muted-foreground md:max-w-2xl">
            Simple tools that make managing prompts effortless.
          </p>
        </Reveal>

        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={80}>
          {features.map((feature, index) => (
            <RevealItem key={feature.title} index={index}>
              <div className="group rounded-2xl border border-border bg-card p-6 transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_24px_40px_-30px_rgba(15,23,42,0.28)]">
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
