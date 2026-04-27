# Free/Premium Plan Limits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add provider-neutral Premium plan detection and enforce Free limits of 30 prompts and 5 categories.

**Architecture:** Supabase owns authoritative entitlement and limit enforcement. The extension uses a shared pure helper for plan normalization and local usage checks, while the dashboard reads entitlement and displays usage. Payment providers only need to update `public.user_entitlements`.

**Tech Stack:** Supabase SQL, Chrome extension JavaScript, Node built-in test runner, Next.js 16 Server Components.

---

### Task 1: Add Extension Limit Helper Tests

**Files:**
- Create: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/plan-limits.js`
- Create: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/plan-limits.test.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/package.json`

- [ ] **Step 1: Write failing tests**

Create tests for:
- default Free plan
- active Premium entitlement
- Free prompt limit at 30
- Free category limit at 5
- existing category reuse at limit
- import allowance calculation

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: FAIL because `src/utils/plan-limits.js` does not exist.

- [ ] **Step 3: Implement pure helper**

Create a browser/CommonJS compatible helper exposing:
- `PLAN_LIMITS`
- `normalizePlan`
- `isPremiumPlan`
- `getPlanLimits`
- `normalizeEntitlement`
- `getUsage`
- `canCreatePrompt`
- `canCreateCategory`
- `getImportAllowance`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`

Expected: PASS.

### Task 2: Enforce Limits In Extension Store

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/storage/prompt-store.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/content/save-modal.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.json`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.dev.json`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.prod.json`

- [ ] **Step 1: Load `plan-limits.js` before `prompt-store.js` in all manifests**

Add `"src/utils/plan-limits.js"` after constants and before store.

- [ ] **Step 2: Add plan fields to store settings**

Add defaults for `plan`, `promptLimit`, `categoryLimit`, and `entitlementStatus`.

- [ ] **Step 3: Block new prompt/category creation when Free limits are reached**

Use helper checks inside `createPrompt`, insert path of `savePrompt`, `addCategory`, `updatePrompt`, and `importPrompts`.

- [ ] **Step 4: Show useful save modal messages**

Catch limit errors in `save-modal.js` and show the message as a warning toast.

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: PASS.

### Task 3: Add Entitlement Fetch And Sync

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/background/service-worker.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/storage/prompt-store.js`

- [ ] **Step 1: Fetch current entitlement from Supabase**

Add background handler `prompttray:entitlement:refresh` that reads `user_entitlements` for the current user and returns normalized plan settings.

- [ ] **Step 2: Update plan settings after login and before full sync**

On auth handoff and local full sync, refresh entitlement so extension settings reflect server state.

- [ ] **Step 3: Add store method `refreshEntitlement`**

Send the background message and merge returned plan fields into settings.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: PASS.

### Task 4: Add Supabase Entitlement And Limit SQL

**Files:**
- Modify: `/Users/denispetrenko/.config/superpowers/worktrees/prompt-manager-landing/feature-plan-limits/supabase/mvp-prompts.sql`

- [ ] **Step 1: Add entitlement schema**

Create `public.user_entitlements` with plan/status constraints, RLS, timestamps, and owner select policy.

- [ ] **Step 2: Add helper functions**

Add `public.is_premium_user(uuid)` and `public.get_user_plan(uuid)`.

- [ ] **Step 3: Add insert limit triggers**

Add triggers for prompts and categories that block inserts above Free limits.

- [ ] **Step 4: Run lint**

Run: `npm run lint`

Expected: PASS.

### Task 5: Show Plan Usage On Dashboard

**Files:**
- Modify: `/Users/denispetrenko/.config/superpowers/worktrees/prompt-manager-landing/feature-plan-limits/src/app/app/page.tsx`

- [ ] **Step 1: Query active entitlement**

Fetch the current user's entitlement alongside prompts and categories.

- [ ] **Step 2: Render plan and usage**

Show Free/Premium state and usage caps in existing dashboard cards.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: PASS.

### Task 6: Final Verification

**Files:**
- All changed files.

- [ ] **Step 1: Run extension tests**

Run: `cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension && npm test`

Expected: PASS.

- [ ] **Step 2: Run web lint**

Run: `cd /Users/denispetrenko/.config/superpowers/worktrees/prompt-manager-landing/feature-plan-limits && npm run lint`

Expected: PASS.

- [ ] **Step 3: Review diffs**

Run: `git diff --stat` inside the web worktree and inspect extension changed files from the main workspace.

Expected: Changes are limited to entitlement SQL, dashboard display, extension limits, and tests.
