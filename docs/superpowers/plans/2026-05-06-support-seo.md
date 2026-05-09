# PromptTray Support SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the `/support` page into a more indexable support hub that covers setup, account connection, sync, troubleshooting, and contact for PromptTray’s multi-platform workflow.

**Architecture:** Keep the existing support page shell, strengthen metadata at the route level, and replace the thin FAQ-only body with several semantic support sections plus a more substantial FAQ block and helpful internal links.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS

---

### Task 1: Strengthen Support Metadata

**Files:**
- Modify: `src/app/support/page.tsx`

- [ ] **Step 1: Update support metadata title and description**

Adjust metadata to better reflect support intent around PromptTray setup, extension connection, sync, and troubleshooting.

- [ ] **Step 2: Keep canonical URL intact**

Preserve the existing canonical URL for `/support`.

### Task 2: Expand The Help Hub Content

**Files:**
- Modify: `src/app/support/page.tsx`

- [ ] **Step 1: Replace the thin support body with structured sections**

Add semantic sections for:
- PromptTray support
- How to set up PromptTray
- How to connect your extension account
- Prompt syncing and account access
- Troubleshooting PromptTray
- Contact support

- [ ] **Step 2: Keep support copy multi-platform**

Make sure the page consistently references ChatGPT, Claude, Gemini, and Perplexity as supported tools rather than centering only one platform.

- [ ] **Step 3: Add stronger FAQ content and internal links**

Include more search-style questions and relevant links to:
- `/`
- `/pricing`
- `/guides/save-prompts-in-chatgpt`
- `/guides/organize-ai-prompts`
- `/guides/manage-prompts-across-ai-tools`

### Task 3: Verify The Changes

**Files:**
- Modify: `src/app/support/page.tsx`

- [ ] **Step 1: Run lint**

Run:
```bash
npm run lint
```

Expected:
- no new errors from support page files

- [ ] **Step 2: Run production build**

Run:
```bash
npm run build
```

Expected:
- build succeeds

- [ ] **Step 3: Final review**

Check:
- page reads like a real help hub
- setup, account connection, sync, troubleshooting, and contact are clearly covered
- support language stays multi-platform
- no unrelated files were changed
