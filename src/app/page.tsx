import type { Metadata } from "next";

import PromptTrayLanding from "@/components/landing/prompttray-landing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Prompt Manager for ChatGPT, Claude, Gemini & Perplexity",
  description:
    "PromptTray is a Chrome extension and prompt manager for ChatGPT, Claude, Gemini, and Perplexity. Save prompts, organize your library, and insert them anywhere in one click.",
  alternates: {
    canonical: "https://www.prompttray.app/",
  },
  keywords: [
    "AI prompt manager",
    "ChatGPT prompt manager",
    "prompt organizer",
    "prompt library",
    "ChatGPT prompts",
    "save and organize prompts",
    "organize AI prompts",
    "Chrome extension for prompts",
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
