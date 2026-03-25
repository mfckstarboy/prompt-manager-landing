import type { Metadata } from "next";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Terms of Service | PromptTray",
  description: "PromptTray terms of service.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      lastUpdated="March 23, 2026"
      description="These terms explain the basic rules for using PromptTray and your responsibilities when accessing the service."
    >
      <LegalSection title="Use of the service">
        <p>
          You may use PromptTray only in compliance with applicable laws and these terms. You are
          responsible for how you use prompts, saved content, and outputs generated through your
          own workflows.
        </p>
      </LegalSection>

      <LegalSection title="User responsibilities">
        <p>
          You agree not to misuse the service, interfere with normal operation, attempt
          unauthorized access, or use PromptTray to store or distribute unlawful or harmful
          content.
        </p>
      </LegalSection>

      <LegalSection title="Account terms">
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and
          for activity that occurs under your account.
        </p>
      </LegalSection>

      <LegalSection title="Limitations of liability">
        <p>
          PromptTray is provided on an “as is” and “as available” basis. To the maximum extent
          permitted by law, we are not liable for indirect, incidental, or consequential damages
          arising from your use of the service.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          We may suspend or terminate access if these terms are violated or if continued access
          creates security, legal, or operational risk.
        </p>
      </LegalSection>

      <LegalSection title="Changes to terms">
        <p>
          We may update these terms from time to time. If we make material changes, we will update
          the date on this page and post the revised version here.
        </p>
      </LegalSection>

      <LegalSection title="Contact information">
        <p>
          Questions about these terms can be sent to{" "}
          <a
            href="mailto:support@prompttray.com"
            className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
          >
            support@prompttray.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
