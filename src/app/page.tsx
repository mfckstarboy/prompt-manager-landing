import type { Metadata } from "next";

import PromptTrayLanding from "@/components/landing/prompttray-landing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "AI Prompt Manager for ChatGPT, Claude & Gemini | PromptTray",
  description:
    "Your prompt library for every AI tool. Save, organize, and reuse prompts instantly across ChatGPT, Claude, Gemini, Perplexity, and more — one click away.",
  alternates: {
    canonical: "https://www.prompttray.app/",
  },
  keywords: [
    "AI prompt manager",
    "prompt manager for ChatGPT",
    "prompt manager for Claude",
    "prompt manager for Gemini",
    "prompt organizer",
    "prompt library",
    "save AI prompts",
    "reuse AI prompts",
    "Chrome extension for AI prompts",
    "multiplatform prompt manager",
    "AI workflow productivity",
    "manage prompts across ChatGPT Claude Gemini Perplexity",
  ],
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <PromptTrayLanding isLoggedIn={!!user} />;
}
