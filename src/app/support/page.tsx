import type { Metadata } from "next";
import Link from "next/link";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import { CHROME_WEB_STORE_URL } from "@/lib/chrome-web-store";

export const metadata: Metadata = {
  title: "PromptTray Support",
  description:
    "PromptTray support for setup, extension account connection, prompt syncing, troubleshooting, and contact help across ChatGPT, Claude, Gemini, and Perplexity.",
  alternates: { canonical: "https://www.prompttray.app/support" },
};

export default function SupportPage() {
  return (
    <LegalShell
      title="PromptTray Support"
      description="Use this help hub for PromptTray setup, extension account connection, syncing, troubleshooting, and support across ChatGPT, Claude, Gemini, and Perplexity."
    >
      <LegalSection title="PromptTray support">
        <p>
          PromptTray is a multi-platform AI prompt manager and Chrome extension built to help you
          save, organize, and reuse prompts across ChatGPT, Claude, Gemini, and Perplexity. If you
          need help getting started or fixing an issue, this page covers the most common setup and
          account questions.
        </p>
        <p>
          If you are looking for plan details first, you can review{" "}
          <Link
            href="/pricing"
            className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
          >
            PromptTray pricing
          </Link>
          . If you want workflow help, you can also read our guides on{" "}
          <Link
            href="/guides/save-prompts-in-chatgpt"
            className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
          >
            saving prompts in ChatGPT
          </Link>
          ,{" "}
          <Link
            href="/guides/organize-ai-prompts"
            className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
          >
            organizing AI prompts
          </Link>
          , and{" "}
          <Link
            href="/guides/manage-prompts-across-ai-tools"
            className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
          >
            managing prompts across AI tools
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="How to set up PromptTray">
        <p>
          Start by installing PromptTray from the{" "}
          <a
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
          >
            Chrome Web Store
          </a>
          . After installation, open one of the supported AI tools in Chrome, such as ChatGPT,
          Claude, Gemini, or Perplexity.
        </p>
        <p>
          Once the extension loads, open the PromptTray sidebar and sign up or sign in with your
          account. After that, PromptTray should be ready to save prompts, organize them into
          categories, and sync your library across devices.
        </p>
        <p>
          If the extension does not appear right away, refresh the AI tool tab after installation
          and make sure the extension is enabled in Chrome.
        </p>
      </LegalSection>

      <LegalSection title="How to connect your extension account">
        <p>
          The easiest way to connect your PromptTray extension account is to sign in from the
          extension sidebar itself. You can also start from the website and then return to the
          extension once your account is active.
        </p>
        <p>
          After login, the extension should recognize your account automatically and connect your
          saved prompt library to the sidebar. If you switch between multiple browser profiles,
          make sure you are signed in to the right PromptTray account in the same Chrome profile
          where the extension is installed.
        </p>
        <p>
          If account connection looks incomplete, sign out and sign back in from the extension
          sidebar first before trying more advanced troubleshooting.
        </p>
      </LegalSection>

      <LegalSection title="Prompt syncing and account access">
        <p>
          PromptTray syncs your saved prompts with your account so you can reuse them across your
          devices and supported AI tools. If syncing works correctly, prompts saved in one session
          should appear again when you sign in on another supported browser session with the same
          account.
        </p>
        <p>
          If your prompts are not syncing, check that you are signed in to the same PromptTray
          account everywhere, that the extension is active, and that you are not using a different
          Chrome profile by mistake.
        </p>
        <p>
          Sync issues are often account-context issues rather than lost data. Verifying the active
          account and reloading the extension session usually resolves the most common cases.
        </p>
      </LegalSection>

      <LegalSection title="Troubleshooting PromptTray">
        <p>If PromptTray is not working as expected, try these checks first:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>refresh the AI tool tab after installing or updating the extension</li>
          <li>make sure PromptTray is enabled in Chrome</li>
          <li>confirm you are signed in to the correct PromptTray account</li>
          <li>check whether you are using the expected Chrome profile</li>
          <li>close and reopen the supported AI tool tab</li>
        </ul>
        <p>
          If prompts are missing, look for account mismatch before assuming the library is gone. If
          the sidebar does not appear, browser refresh and extension enablement are the first two
          things to verify.
        </p>
        <p>
          For broader workflow questions, the homepage at{" "}
          <Link
            href="/"
            className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
          >
            prompttray.app
          </Link>{" "}
          and the guide pages can help explain the intended setup.
        </p>
      </LegalSection>

      <LegalSection title="FAQ">
        <div className="space-y-5">
          <div>
            <p className="font-medium text-foreground">How do I install PromptTray?</p>
            <p className="mt-2">
              Install the extension from the{" "}
              <a
                href={CHROME_WEB_STORE_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
              >
                Chrome Web Store
              </a>
              , open a supported AI tool, and sign in through the PromptTray sidebar.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">
              How do I connect my PromptTray extension account?
            </p>
            <p className="mt-2">
              Sign in from the extension sidebar or from the website, then return to the extension
              in the same Chrome profile so it can connect your saved prompt library correctly.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">
              Why is PromptTray not showing in ChatGPT or another AI tool?
            </p>
            <p className="mt-2">
              Refresh the tab, confirm the extension is enabled in Chrome, and reopen the
              supported AI tool. In many cases the sidebar appears after the session reloads.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Why are my prompts not syncing?</p>
            <p className="mt-2">
              First check that you are signed in to the same PromptTray account everywhere and are
              using the expected Chrome profile. Many sync problems come from account mismatches.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">
              Can I use PromptTray across multiple AI tools?
            </p>
            <p className="mt-2">
              Yes. PromptTray is built to support prompt workflows across ChatGPT, Claude, Gemini,
              and Perplexity rather than being limited to one AI app.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Can I edit or delete saved prompts?</p>
            <p className="mt-2">
              Yes. Prompt editing, organizing, and deleting happen inside the PromptTray sidebar
              while you work inside supported AI tools.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Contact support">
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
        <p>
          When you write in, include a short description of the issue, which supported AI tool you
          were using, what you expected to happen, and any steps or screenshots that help reproduce
          it.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
