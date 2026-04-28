# Upgrade Paywall UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add contextual Free/Premium upgrade UI to the PromptTray extension settings and web dashboard, with Upgrade buttons routed through configurable checkout URLs.

**Architecture:** The extension owns its own upgrade URL constant and background tab-opening message because it cannot import from the Next.js app. The web app owns a small billing helper that validates `NEXT_PUBLIC_UPGRADE_CHECKOUT_URL` and falls back to `${getSiteUrl()}/support`. Plan status and limit thresholds are derived from existing entitlement and usage data; no billing schema or checkout provider integration is added.

**Tech Stack:** Chrome Extension Manifest V3, vanilla JS content scripts, Node test runner, Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Supabase.

---

## File Structure

Repository note: `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing` is the only Git repository in this workspace. `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension` is not inside a Git worktree, so extension task checkpoints use test/status verification instead of Git commits.

- `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/plan-limits.js`: add pure paywall threshold/status helpers shared by tests and UI.
- `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/plan-limits.test.js`: add threshold helper tests.
- `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/constants.js`: add `UPGRADE_CHECKOUT_URL`.
- `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/background/service-worker.js`: add upgrade URL validation/fallback and `prompttray:upgrade:open` handler.
- `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/content/sidebar.js`: render authenticated plan section in settings and handle upgrade clicks.
- `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/styles/content.css`: style plan card, usage bars, and warning states.
- `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/src/lib/billing.ts`: create web checkout URL helper.
- `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/src/app/app/page.tsx`: add dashboard Plan & usage UI and wire Upgrade button.

---

### Task 1: Extension Plan Threshold Helper

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/plan-limits.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/plan-limits.test.js`

- [ ] **Step 1: Add failing tests for paywall status**

Add this import to the destructuring require in `test/plan-limits.test.js`:

```js
  getPaywallStatus,
```

Add these tests after `testing plan override controls effective plan`:

```js
test("paywall status is premium for premium plans", () => {
  const status = getPaywallStatus({
    plan: "premium",
    usage: { promptCount: 100, categoryCount: 20 }
  });

  assert.equal(status.plan, "premium");
  assert.equal(status.isPremium, true);
  assert.equal(status.severity, "premium");
  assert.equal(status.promptLimit, null);
  assert.equal(status.categoryLimit, null);
});

test("paywall status is normal for free users below thresholds", () => {
  const status = getPaywallStatus({
    plan: "free",
    usage: { promptCount: 12, categoryCount: 2 }
  });

  assert.equal(status.plan, "free");
  assert.equal(status.isPremium, false);
  assert.equal(status.severity, "normal");
  assert.equal(status.promptPercent, 40);
  assert.equal(status.categoryPercent, 40);
  assert.equal(status.headline, "Free plan");
});

test("paywall status is near limit at free thresholds", () => {
  const status = getPaywallStatus({
    plan: "free",
    usage: { promptCount: 24, categoryCount: 4 }
  });

  assert.equal(status.severity, "near");
  assert.equal(status.headline, "You're close to the Free limit");
  assert.equal(status.promptPercent, 80);
  assert.equal(status.categoryPercent, 80);
});

test("paywall status is at limit when either free limit is reached", () => {
  const status = getPaywallStatus({
    plan: "free",
    usage: { promptCount: 30, categoryCount: 3 }
  });

  assert.equal(status.severity, "limit");
  assert.equal(status.headline, "Free limit reached");
  assert.equal(status.promptPercent, 100);
  assert.equal(status.categoryPercent, 60);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test -- test/plan-limits.test.js
```

Expected: FAIL with `getPaywallStatus is not a function`.

- [ ] **Step 3: Add the helper implementation**

In `src/utils/plan-limits.js`, add these constants after `PLAN_LIMITS`:

```js
  const PAYWALL_THRESHOLDS = {
    categoryNearLimit: 4,
    promptNearLimit: 24
  };
```

Add these functions after `getUsage`:

```js
  function clampPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(number)));
  }

  function getUsagePercent(used, limit) {
    if (limit === null) {
      return 0;
    }

    return clampPercent(((Number(used) || 0) / limit) * 100);
  }

  function getPaywallStatus({ plan, usage } = {}) {
    const normalizedPlan = normalizePlan(plan);
    const limits = getPlanLimits(normalizedPlan);
    const promptCount = Number(usage?.promptCount) || 0;
    const categoryCount = Number(usage?.categoryCount) || 0;
    const isPremium = isPremiumPlan(normalizedPlan);

    if (isPremium) {
      return {
        body: "Unlimited prompts and categories are active on this account.",
        categoryCount,
        categoryLimit: null,
        categoryPercent: 0,
        headline: "Premium plan",
        isPremium: true,
        plan: "premium",
        promptCount,
        promptLimit: null,
        promptPercent: 0,
        severity: "premium"
      };
    }

    const promptAtLimit = promptCount >= limits.promptLimit;
    const categoryAtLimit = categoryCount >= limits.categoryLimit;
    const promptNearLimit = promptCount >= PAYWALL_THRESHOLDS.promptNearLimit;
    const categoryNearLimit = categoryCount >= PAYWALL_THRESHOLDS.categoryNearLimit;
    const severity = promptAtLimit || categoryAtLimit
      ? "limit"
      : promptNearLimit || categoryNearLimit
        ? "near"
        : "normal";

    const copy = {
      limit: {
        body: "Upgrade to Premium for unlimited prompts and categories.",
        headline: "Free limit reached"
      },
      near: {
        body: "Upgrade before your prompt workflow hits the Free plan cap.",
        headline: "You're close to the Free limit"
      },
      normal: {
        body: "Premium unlocks unlimited prompts and categories.",
        headline: "Free plan"
      }
    }[severity];

    return {
      body: copy.body,
      categoryCount,
      categoryLimit: limits.categoryLimit,
      categoryPercent: getUsagePercent(categoryCount, limits.categoryLimit),
      headline: copy.headline,
      isPremium: false,
      plan: "free",
      promptCount,
      promptLimit: limits.promptLimit,
      promptPercent: getUsagePercent(promptCount, limits.promptLimit),
      severity
    };
  }
```

Add `getPaywallStatus` and `PAYWALL_THRESHOLDS` to the `api` object:

```js
    getPaywallStatus,
    PAYWALL_THRESHOLDS,
```

- [ ] **Step 4: Run tests and verify they pass**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test -- test/plan-limits.test.js
```

Expected: PASS for all plan limit tests.

- [ ] **Step 5: Verify Task 1 scope**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
git rev-parse --show-toplevel 2>/dev/null || true
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git status --short
```

Expected: first command prints nothing because the extension is not a Git worktree; landing repo status does not include extension helper/test files.

---

### Task 2: Extension Upgrade Link Handling

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/constants.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/background/service-worker.js`

- [ ] **Step 1: Add the extension checkout constant**

In `src/utils/constants.js`, add `UPGRADE_CHECKOUT_URL` immediately after `WEBSITE_AUTH_ORIGIN`:

```js
      UPGRADE_CHECKOUT_URL: "",
```

- [ ] **Step 2: Add upgrade URL helpers to the service worker**

In `src/background/service-worker.js`, find the existing website origin constants near the top. Add:

```js
const EXTENSION_UPGRADE_CHECKOUT_URL = "";
```

Add these functions near `getWebsiteAuthOrigin()`:

```js
function getValidExternalUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

async function getUpgradeUrl() {
  const websiteAuthOrigin = await getWebsiteAuthOrigin();
  return (
    getValidExternalUrl(EXTENSION_UPGRADE_CHECKOUT_URL) ||
    getValidExternalUrl(`${websiteAuthOrigin}/support`) ||
    "https://prompttray.app/support"
  );
}
```

- [ ] **Step 3: Add the background message handler**

In `chrome.runtime.onMessage.addListener`, add this block after the `prompttray:auth:start` handler and before sync handlers:

```js
  if (message.type === "prompttray:upgrade:open") {
    getUpgradeUrl()
      .then((url) => chrome.tabs.create({ url }).then(() => {
        sendResponse({ ok: true, url });
      }))
      .catch((error) => {
        console.error("[Prompt Organizer] Failed to open upgrade URL.", error);
        sendResponse({
          ok: false,
          error: "Unable to open PromptTray upgrade page."
        });
      });
    return true;
  }
```

- [ ] **Step 4: Run extension tests**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS for all extension Node tests.

- [ ] **Step 5: Verify Task 2 scope**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
git rev-parse --show-toplevel 2>/dev/null || true
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git status --short
```

Expected: first command prints nothing because the extension is not a Git worktree; landing repo status does not include extension constants/service-worker files.

---

### Task 3: Extension Settings Plan UI

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/content/sidebar.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/styles/content.css`

- [ ] **Step 1: Add upgrade click behavior**

In `src/content/sidebar.js`, add this method near `completeAuth()`/`logout()` methods:

```js
    async openUpgrade() {
      try {
        const response = await chrome.runtime.sendMessage({
          type: "prompttray:upgrade:open"
        });

        if (!response?.ok) {
          throw new Error(response?.error || "Unable to open upgrade page.");
        }
      } catch (error) {
        console.warn("[Prompt Organizer] Failed to open upgrade page.", error);
        toast?.show?.("Unable to open upgrade page", "warning");
      }
    }
```

Add this switch case after `case "log-in":`:

```js
        case "upgrade":
          await this.openUpgrade();
          return;
```

- [ ] **Step 2: Add the plan section renderer**

In `src/content/sidebar.js`, add this method before `renderSettingsView()`:

```js
    renderPlanSection() {
      if (!this.isAuthenticated()) {
        return "";
      }

      const planLimits = namespace.planLimits;
      const plan = planLimits.getEffectivePlan({
        plan: this.settings?.plan,
        testingPlanOverride: this.settings?.testingPlanOverride
      });
      const usage = planLimits.getUsage({
        prompts: this.prompts,
        categories: this.storedCategories,
        countUnusedCategories: true
      });
      const status = planLimits.getPaywallStatus({ plan, usage });
      const severityClass = `po-plan-card--${status.severity}`;

      if (status.isPremium) {
        return this.renderSettingsSection("Plan", `
          <div class="po-plan-card po-plan-card--premium">
            <div class="po-plan-card__header">
              <div>
                <p class="po-plan-card__eyebrow">Current plan</p>
                <h3>${escapeHtml(status.headline)}</h3>
              </div>
              <span class="po-plan-card__badge">Unlimited</span>
            </div>
            <p class="po-plan-card__body">${escapeHtml(status.body)}</p>
          </div>
        `);
      }

      return this.renderSettingsSection("Plan", `
        <div class="po-plan-card ${severityClass}">
          <div class="po-plan-card__header">
            <div>
              <p class="po-plan-card__eyebrow">Current plan</p>
              <h3>${escapeHtml(status.headline)}</h3>
            </div>
            <span class="po-plan-card__badge">Free</span>
          </div>
          <p class="po-plan-card__body">${escapeHtml(status.body)}</p>
          <div class="po-plan-card__usage">
            <div class="po-plan-usage">
              <div class="po-plan-usage__label">
                <span>Prompts</span>
                <strong>${status.promptCount}/${status.promptLimit}</strong>
              </div>
              <span class="po-plan-usage__bar" aria-hidden="true">
                <span style="width: ${status.promptPercent}%"></span>
              </span>
            </div>
            <div class="po-plan-usage">
              <div class="po-plan-usage__label">
                <span>Categories</span>
                <strong>${status.categoryCount}/${status.categoryLimit}</strong>
              </div>
              <span class="po-plan-usage__bar" aria-hidden="true">
                <span style="width: ${status.categoryPercent}%"></span>
              </span>
            </div>
          </div>
          <button class="po-plan-card__button" type="button" data-action="upgrade">
            Upgrade
          </button>
        </div>
      `);
    }
```

In `renderSettingsView()`, add:

```js
      const planSection = this.renderPlanSection();
```

Then render `${planSection}` immediately after `${accountSection}` in the settings layout.

- [ ] **Step 3: Add plan card CSS**

In `src/styles/content.css`, add this block near the existing settings styles:

```css
.po-plan-card {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 40px -34px rgba(15, 23, 42, 0.3);
  padding: 16px;
}

.po-plan-card--near,
.po-plan-card--limit {
  border-color: rgba(217, 119, 6, 0.28);
  background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
}

.po-plan-card--premium {
  border-color: rgba(16, 185, 129, 0.28);
  background: linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%);
}

.po-plan-card__header,
.po-plan-usage__label {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.po-plan-card__eyebrow {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
  margin: 0 0 7px;
  text-transform: uppercase;
}

.po-plan-card h3 {
  color: #0f172a;
  font-size: 18px;
  font-weight: 720;
  line-height: 1.15;
  margin: 0;
}

.po-plan-card__badge {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 999px;
  color: #334155;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  padding: 7px 9px;
  white-space: nowrap;
}

.po-plan-card__body {
  color: #475569;
  font-size: 13px;
  line-height: 1.45;
  margin: 12px 0 0;
}

.po-plan-card__usage {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.po-plan-usage {
  display: grid;
  gap: 7px;
}

.po-plan-usage__label {
  color: #475569;
  font-size: 12px;
  line-height: 1.2;
}

.po-plan-usage__label strong {
  color: #0f172a;
  font-weight: 750;
}

.po-plan-usage__bar {
  display: block;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.24);
}

.po-plan-usage__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #2563eb;
}

.po-plan-card--near .po-plan-usage__bar span,
.po-plan-card--limit .po-plan-usage__bar span {
  background: #d97706;
}

.po-plan-card__button {
  align-items: center;
  background: #0f172a;
  border: 0;
  border-radius: 999px;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font-size: 13px;
  font-weight: 750;
  justify-content: center;
  margin-top: 15px;
  min-height: 38px;
  padding: 0 16px;
  transition: transform 160ms ease, background-color 160ms ease, box-shadow 160ms ease;
  width: 100%;
}

.po-plan-card__button:hover {
  background: #1e293b;
  box-shadow: 0 16px 28px -24px rgba(15, 23, 42, 0.5);
  transform: translateY(-1px);
}

.po-sidebar-shell[data-theme="dark"] .po-plan-card {
  border-color: rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, #111827 0%, #0f172a 100%);
}

.po-sidebar-shell[data-theme="dark"] .po-plan-card--near,
.po-sidebar-shell[data-theme="dark"] .po-plan-card--limit {
  border-color: rgba(245, 158, 11, 0.32);
  background: linear-gradient(180deg, rgba(120, 53, 15, 0.42) 0%, #0f172a 100%);
}

.po-sidebar-shell[data-theme="dark"] .po-plan-card--premium {
  border-color: rgba(16, 185, 129, 0.32);
  background: linear-gradient(180deg, rgba(6, 78, 59, 0.36) 0%, #0f172a 100%);
}

.po-sidebar-shell[data-theme="dark"] .po-plan-card h3,
.po-sidebar-shell[data-theme="dark"] .po-plan-usage__label strong {
  color: #f8fafc;
}

.po-sidebar-shell[data-theme="dark"] .po-plan-card__body,
.po-sidebar-shell[data-theme="dark"] .po-plan-usage__label {
  color: #cbd5e1;
}

.po-sidebar-shell[data-theme="dark"] .po-plan-card__eyebrow {
  color: #94a3b8;
}

.po-sidebar-shell[data-theme="dark"] .po-plan-card__badge {
  border-color: rgba(148, 163, 184, 0.22);
  color: #e2e8f0;
}
```

- [ ] **Step 4: Run extension tests**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS for all extension Node tests.

- [ ] **Step 5: Verify Task 3 scope**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
git rev-parse --show-toplevel 2>/dev/null || true
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git status --short
```

Expected: first command prints nothing because the extension is not a Git worktree; landing repo status does not include extension sidebar/style files.

---

### Task 4: Web Billing Helper

**Files:**
- Create: `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/src/lib/billing.ts`

- [ ] **Step 1: Create billing helper**

Create `src/lib/billing.ts` with:

```ts
import { getSiteUrl } from "@/lib/site-url";

function normalizeHttpsUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getUpgradeCheckoutUrl() {
  return (
    normalizeHttpsUrl(process.env.NEXT_PUBLIC_UPGRADE_CHECKOUT_URL) ??
    `${getSiteUrl()}/support`
  );
}
```

- [ ] **Step 2: Run lint**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
npm run lint
```

Expected: PASS with no new lint errors.

- [ ] **Step 3: Commit Task 4**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git add src/lib/billing.ts
git commit -m "feat: add upgrade checkout helper"
```

Expected: commit succeeds with the new billing helper staged.

---

### Task 5: Web Dashboard Plan & Usage UI

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/src/app/app/page.tsx`

- [ ] **Step 1: Import billing helper and icon**

In `src/app/app/page.tsx`, add `Sparkles` to the lucide import list:

```ts
  Sparkles,
```

Add this import near the other `@/lib` imports:

```ts
import { getUpgradeCheckoutUrl } from "@/lib/billing";
```

- [ ] **Step 2: Add dashboard paywall helpers**

Add these constants after `FREE_CATEGORY_LIMIT`:

```ts
const FREE_PROMPT_NEAR_LIMIT = 24;
const FREE_CATEGORY_NEAR_LIMIT = 4;
```

Add this helper after `getDashboardPlan`:

```tsx
function getDashboardPaywallState({
  categoryCount,
  isPremium,
  promptCount,
}: {
  categoryCount: number;
  isPremium: boolean;
  promptCount: number;
}) {
  if (isPremium) {
    return {
      body: "Unlimited prompts and categories are active on this account.",
      headline: "Premium plan",
      severity: "premium" as const,
    };
  }

  const atLimit = promptCount >= FREE_PROMPT_LIMIT || categoryCount >= FREE_CATEGORY_LIMIT;
  const nearLimit =
    promptCount >= FREE_PROMPT_NEAR_LIMIT || categoryCount >= FREE_CATEGORY_NEAR_LIMIT;

  if (atLimit) {
    return {
      body: "Upgrade to Premium for unlimited prompts and categories.",
      headline: "Free limit reached",
      severity: "limit" as const,
    };
  }

  if (nearLimit) {
    return {
      body: "Upgrade before your prompt workflow hits the Free plan cap.",
      headline: "You're close to the Free limit",
      severity: "near" as const,
    };
  }

  return {
    body: "Premium unlocks unlimited prompts and categories when your library grows.",
    headline: "Free plan",
    severity: "normal" as const,
  };
}
```

- [ ] **Step 3: Compute upgrade URL and paywall state**

After `const isPremium = plan === "premium";`, add:

```ts
  const upgradeCheckoutUrl = getUpgradeCheckoutUrl();
  const paywallState = getDashboardPaywallState({
    categoryCount: totalCategories,
    isPremium,
    promptCount: totalPrompts,
  });
```

- [ ] **Step 4: Replace the small plan status tile**

In the `Extension status` grid, replace the current `Plan` tile with:

```tsx
                  <div className="rounded-2xl border border-border bg-background px-4 py-4">
                    <p className="landing-label text-muted-foreground">Plan</p>
                    <p className="landing-h4 mt-1">{planLabel}</p>
                    <p className="landing-small mt-1 text-muted-foreground">
                      {isPremium ? "Unlimited library" : "Free limits active"}
                    </p>
                  </div>
```

- [ ] **Step 5: Add Plan & usage card above Prompts overview**

Add this section between the `Extension status` section and the current `Prompts overview` section:

```tsx
              <section
                id="plan-usage"
                className={`rounded-[28px] border p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.2)] ${
                  paywallState.severity === "premium"
                    ? "border-emerald-200 bg-emerald-50/80"
                    : paywallState.severity === "near" || paywallState.severity === "limit"
                      ? "border-amber-200 bg-amber-50/85"
                      : "border-border/80 bg-card"
                }`}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-background/80 p-2 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="landing-label text-muted-foreground">Plan & usage</p>
                    </div>
                    <h2
                      className="mt-4 text-[30px] leading-[34px] tracking-[-0.01em] text-foreground"
                      style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                    >
                      {paywallState.headline}
                    </h2>
                    <p className="landing-body mt-2 max-w-xl text-muted-foreground">
                      {paywallState.body}
                    </p>
                  </div>

                  {!isPremium ? (
                    <Button asChild className="landing-ui h-11 shrink-0 gap-2 px-5">
                      <a href={upgradeCheckoutUrl} target="_blank" rel="noreferrer">
                        Upgrade
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <span className="landing-label rounded-full bg-emerald-100 px-3 py-2 text-emerald-700">
                      Premium active
                    </span>
                  )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-5">
                    <p className="landing-label text-muted-foreground">Prompt usage</p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                      {promptUsageLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-5">
                    <p className="landing-label text-muted-foreground">Category usage</p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                      {categoryUsageLabel}
                    </p>
                  </div>
                </div>
              </section>
```

- [ ] **Step 6: Remove duplicate usage cards from Prompts overview**

In `Prompts overview`, replace the three-column usage grid with a single recent prompt panel:

```tsx
                <div className="mt-6 rounded-2xl border border-border bg-secondary/60 px-4 py-5">
                  <p className="landing-label text-muted-foreground">Most recent</p>
                  {recentPrompt ? (
                    <div className="mt-3 flex items-start gap-3">
                      {renderPromptAvatar(recentPrompt)}
                      <p className="landing-body min-w-0 text-foreground">{recentPrompt.title}</p>
                    </div>
                  ) : (
                    <p className="landing-body mt-3 text-foreground">No prompts saved yet</p>
                  )}
                </div>
```

- [ ] **Step 7: Run lint**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
npm run lint
```

Expected: PASS with no new lint errors.

- [ ] **Step 8: Commit Task 5**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git add src/app/app/page.tsx
git commit -m "feat: add dashboard upgrade card"
```

Expected: commit succeeds with only dashboard changes staged.

---

### Task 6: Final Verification

**Files:**
- Review: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/content/sidebar.js`
- Review: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/styles/content.css`
- Review: `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/src/app/app/page.tsx`

- [ ] **Step 1: Run extension tests**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS for `image-optimizer.test.js`, `plan-limits.test.js`, and `prompt-avatar.test.js`.

- [ ] **Step 2: Run web lint**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
npm run lint
```

Expected: PASS with no new lint errors.

- [ ] **Step 3: Review diff scope**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git status --short
git diff --stat
```

Expected: landing repo working tree is clean after committed web changes; extension changes were verified by tests because the extension folder is not a Git worktree.

- [ ] **Step 4: Manual behavior checklist**

Verify from code review or browser/extension preview:

```text
Extension authenticated Free settings shows Plan section and Upgrade button.
Extension authenticated Premium settings shows Premium plan and no Upgrade button.
Extension unauthenticated settings does not show upgrade UI.
Extension Upgrade click sends prompttray:upgrade:open.
Dashboard Free plan shows Plan & usage card and Upgrade link.
Dashboard Premium plan shows Premium active and no Upgrade link.
Checkout helper falls back to /support when no checkout URL is configured.
```

- [ ] **Step 5: Commit final plan updates if checklist changes were needed**

Run only if this plan was edited during execution:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git add docs/superpowers/plans/2026-04-28-upgrade-paywall-ui.md
git commit -m "docs: update upgrade paywall implementation plan"
```

Expected: skipped if the plan was not edited after initial creation; otherwise commit succeeds.
