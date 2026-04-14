import type { Metadata } from "next";

import PromptTrayLanding from "@/components/landing/prompttray-landing";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.prompttray.app/",
  },
};

export default function Home() {
  return <PromptTrayLanding />;
}
