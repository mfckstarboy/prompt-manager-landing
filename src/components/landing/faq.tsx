import Link from "next/link";

import { Reveal } from "@/components/landing/landing-motion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "What is PromptTray?",
    answer:
      "PromptTray is a Chrome extension and prompt manager that helps you save, organize, and reuse AI prompts inside ChatGPT, Claude, Gemini, and Perplexity.",
  },
  {
    question: "How is PromptTray different from saving prompts in Notion or Google Docs?",
    answer:
      "PromptTray lives inside the tools where you already write prompts, so you can save and insert them without switching tabs or copying from another app.",
  },
  {
    question: "Does PromptTray work across multiple AI tools?",
    answer:
      "Yes. You can use the same prompt library across ChatGPT, Claude, Gemini, and Perplexity.",
  },
  {
    question: "Can I organize my ChatGPT prompts by category or tag?",
    answer:
      "Yes. PromptTray helps you organize prompts with categories, search, and reusable templates so your library stays easy to manage.",
  },
  {
    question: "Can I use PromptTray for free?",
    answer:
      "Yes. PromptTray has a free plan, and Premium adds advanced features like unlimited prompts, variables, and version history.",
  },
  {
    question: "What happens after I install it?",
    answer:
      "Open ChatGPT, Claude, Gemini, or Perplexity, sign in, and start saving prompts directly from the sidebar.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export function FAQ() {
  return (
    <section className="bg-muted/30 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <Reveal className="mb-14 text-center" variant="fade-up">
          <h2 className="landing-h2 mb-4">PromptTray FAQ</h2>
          <p className="landing-body mx-auto max-w-2xl text-muted-foreground">
            Quick answers about saving, organizing, and reusing AI prompts across ChatGPT,
            Claude, Gemini, and Perplexity.
          </p>
        </Reveal>

        <div className="grid gap-4">
          {faqs.map((faq) => (
            <Reveal key={faq.question} variant="fade-up">
              <article className="rounded-2xl border border-border bg-card p-6 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.22)]">
                <h3 className="landing-h4 mb-3">{faq.question}</h3>
                <p className="landing-body text-muted-foreground">{faq.answer}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 rounded-3xl border border-border bg-background p-8 text-center" variant="fade-up">
          <h3 className="landing-h3 mb-3">Need plan details or setup help?</h3>
          <p className="landing-body mx-auto max-w-2xl text-muted-foreground">
            Compare free and Premium features on the pricing page, visit support for setup help,
            or start with our text guides for saving prompts, organizing them, and reusing them
            across AI tools.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="landing-ui h-12 px-6">
              <Link href="/pricing">View pricing</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="landing-ui h-12 px-6">
              <Link href="/support">Visit support</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3 text-left sm:text-center">
            <Link
              href="/guides/save-prompts-in-chatgpt"
              className="landing-small font-medium text-foreground transition-colors duration-200 hover:text-primary"
            >
              How to save prompts in ChatGPT
            </Link>
            <Link
              href="/guides/organize-ai-prompts"
              className="landing-small font-medium text-foreground transition-colors duration-200 hover:text-primary"
            >
              How to organize AI prompts
            </Link>
            <Link
              href="/guides/manage-prompts-across-ai-tools"
              className="landing-small font-medium text-foreground transition-colors duration-200 hover:text-primary"
            >
              Best way to manage prompts across ChatGPT, Claude, and Gemini
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
