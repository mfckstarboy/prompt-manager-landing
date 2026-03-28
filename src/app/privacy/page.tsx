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
      description="PromptTray collects account and prompt data needed to run the website and Chrome extension, sync your saved prompts, and keep your account secure."
    >
      <LegalSection title="Information we collect">
        <p>
          We collect the email address tied to your PromptTray account, the prompt text/content you
          choose to save, your categories, and settings needed to run the product. The Chrome
          extension also stores prompt data, categories, settings, and account session data locally
          in extension storage so your library can load quickly and stay connected after you sign
          in.
        </p>
      </LegalSection>

      <LegalSection title="How we use data">
        <p>
          We use this information to authenticate your account, let you save and insert prompts on
          ChatGPT pages, sync your prompt library across installs and devices, troubleshoot product
          issues, and protect the service from abuse. You can create an account or log in from the
          extension sidebar or from the PromptTray website, and the website completes the account
          sign-in that reconnects the extension to your account.
        </p>
      </LegalSection>

      <LegalSection title="Data storage and security">
        <p>
          PromptTray stores saved prompts and categories in our hosted database and keeps a local
          copy in Chrome extension storage on your browser. We use reasonable safeguards to protect
          account information and saved content, but no system can guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="Third-party services">
        <p>
          We use Supabase to authenticate accounts and store synced prompt data. We may also use
          standard email and infrastructure providers when needed to operate support or product
          delivery. We do not sell your personal data, and we do not share your saved prompts with
          advertisers or data brokers. We only transfer data to service providers when needed to
          run the product features described here.
        </p>
      </LegalSection>

      <LegalSection title="User rights">
        <p>
          You can request access to your account data or ask us to delete your account and related
          stored information. If you remove the extension or log out, local extension data is
          cleared from that browser, while account-linked prompts remain in your PromptTray account
          unless you ask us to delete them.
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
