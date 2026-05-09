# Best ChatGPT Prompt Manager Comparison Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the first comparison-intent SEO page at `/compare/best-chatgpt-prompt-manager` while positioning PromptTray as a multi-platform AI prompt manager.

**Architecture:** Add one new static App Router page using the existing guide-style presentation layer, tailored for commercial comparison intent. The page will answer the ChatGPT-led query directly, explain decision criteria, and funnel users into pricing, support, and the existing guide cluster.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS

---

### Task 1: Create The Comparison Page Route

**Files:**
- Create: `src/app/compare/best-chatgpt-prompt-manager/page.tsx`

- [ ] **Step 1: Add route metadata**

Create metadata aligned to the comparison query while keeping positioning multi-platform.

- [ ] **Step 2: Build the page content**

Include:
- query-aligned H1
- direct intro paragraph
- sections for decision criteria, workflow pain points, multi-platform value, and PromptTray fit
- FAQ
- CTA
- internal links to homepage, pricing, support, and the three existing guides

- [ ] **Step 3: Keep the content fair and non-fabricated**

Avoid fake rankings, unsupported competitor claims, or exaggerated “best” language. The page should work as a decision guide with PromptTray clearly recommended for the described workflow.

### Task 2: Add Discovery Support

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add the comparison URL to the sitemap**

Include `/compare/best-chatgpt-prompt-manager` in the sitemap with a reasonable SEO priority.

### Task 3: Verify The Changes

**Files:**
- Create: `src/app/compare/best-chatgpt-prompt-manager/page.tsx`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Run lint**

Run:
```bash
npm run lint
```

Expected:
- no new errors from comparison page files

- [ ] **Step 2: Run production build**

Run:
```bash
npm run build
```

Expected:
- build succeeds
- comparison route appears in generated route output

- [ ] **Step 3: Final review**

Check:
- page answers the query quickly
- PromptTray remains clearly multi-platform
- internal links are useful and natural
- no unrelated files were changed
