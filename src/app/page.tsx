import type { Metadata } from "next";

import PromptTrayLanding from "@/components/landing/prompttray-landing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.prompttray.app/",
  },
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <PromptTrayLanding isLoggedIn={!!user} />;
}
