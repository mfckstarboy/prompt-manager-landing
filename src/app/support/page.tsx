import type { Metadata } from "next";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Help | PromptTray",
  description: "PromptTray help, setup guidance, and contact information.",
};

export default function SupportPage() {
  return (
    <LegalShell
      title="Help"
      description="If you need help with PromptTray, start here for setup guidance, troubleshooting, and support."
    >
      <LegalSection title="Contact">
        <p>
          Email us at{" "}
          <a
            href="mailto:support@prompttray.com"
            className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
          >
            support@prompttray.com
          </a>
          .
        </p>
        <p>We usually reply within 24 hours.</p>
      </LegalSection>

      <LegalSection title="FAQ">
        <div className="space-y-5">
          <div>
            <p className="font-medium text-foreground">How do I install PromptTray?</p>
            <p className="mt-2">
              Install the extension, open ChatGPT, and sign in when PromptTray asks you to connect
              your account. You can start sign up or login from the extension sidebar or from the
              PromptTray website, and PromptTray appears inside ChatGPT and syncs your saved
              prompts with your account.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Can I edit or delete saved prompts?</p>
            <p className="mt-2">
              Yes. Prompt editing, organizing, and deleting happen inside the PromptTray sidebar
              while you work in ChatGPT.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">What should I include when reporting a bug?</p>
            <p className="mt-2">
              A short description, the tool or page you were using, and any screenshots or steps to
              reproduce the issue are helpful.
            </p>
          </div>
        </div>
      </LegalSection>
    </LegalShell>
  );
}
