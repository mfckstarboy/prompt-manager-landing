import type { Metadata } from "next";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Support | PromptTray",
  description: "PromptTray support and contact information.",
};

export default function SupportPage() {
  return (
    <LegalShell
      title="Support"
      description="If you need help with PromptTray, send us a message and we’ll point you in the right direction."
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
              Install the extension, sign in, and PromptTray will be available inside supported AI
              tools.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Can I edit or delete saved prompts?</p>
            <p className="mt-2">
              Yes. You can update, organize, or remove saved prompts from your PromptTray library
              at any time.
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
