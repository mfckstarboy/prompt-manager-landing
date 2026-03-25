import type { Metadata } from "next";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy | PromptTray",
  description: "PromptTray privacy policy and data handling information.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      lastUpdated="March 23, 2026"
      description="PromptTray collects limited account, prompt, and usage information so we can provide the service, keep it secure, and improve reliability."
    >
      <LegalSection title="Information we collect">
        <p>
          We may collect your email address, the prompts and folders you choose to save in
          PromptTray, and basic usage data such as browser activity related to extension features.
        </p>
      </LegalSection>

      <LegalSection title="How we use data">
        <p>
          We use this information to operate your account, sync saved prompts, troubleshoot issues,
          prevent abuse, and improve the product experience.
        </p>
      </LegalSection>

      <LegalSection title="Data storage and security">
        <p>
          We store data using reasonable technical and organizational safeguards designed to protect
          account information and saved content. No system is completely risk-free, but we work to
          keep access limited and secure.
        </p>
      </LegalSection>

      <LegalSection title="Third-party services">
        <p>
          PromptTray may rely on third-party infrastructure providers, analytics tools, and email
          delivery services to operate the product. Those providers only receive the information
          needed to perform their services for us.
        </p>
      </LegalSection>

      <LegalSection title="User rights">
        <p>
          You can request access to your account data or ask us to delete your account and related
          stored information, subject to any legal obligations we may have to retain limited
          records.
        </p>
      </LegalSection>

      <LegalSection title="Contact email">
        <p>
          For privacy questions or data requests, contact{" "}
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
