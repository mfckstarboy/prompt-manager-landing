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
    description: "Capture any prompt with one click. It's saved instantly — never rewrite it again.",
  },
  {
    icon: FolderOpen,
    title: "Categories & tags",
    description: "Organize by project, client, or workflow. Keep your library clean and navigable.",
  },
  {
    icon: Search,
    title: "Instant search",
    description: "Find any prompt in milliseconds. Full-text search across your entire library.",
  },
  {
    icon: MousePointerClick,
    title: "One-click insert",
    description: "Click once to insert any prompt into ChatGPT, Claude, Gemini, or Perplexity.",
  },
  {
    icon: PanelRight,
    title: "Native in every AI tool",
    description: "A sidebar that lives inside ChatGPT, Claude, Gemini, and Perplexity. No tab switching.",
  },
  {
    icon: Cloud,
    title: "Cloud sync",
    description: "Your library lives in the cloud. Accessible from any device, always up to date.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4">Built for AI power users</h2>
          <p className="landing-body mx-auto max-w-xl text-muted-foreground md:max-w-2xl">
            A clean sidebar that lives inside your AI tools — no tab switching, no copy-pasting.
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
