# PromptTray Pricing SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the `/pricing` page for commercial SEO intent while reinforcing PromptTray as a multi-platform AI prompt manager.

**Architecture:** Keep the existing pricing page structure and billing UI, strengthen metadata at the route level, and add a short block of crawlable explanatory copy below the pricing cards inside the existing pricing content component.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS

---

### Task 1: Strengthen Pricing Metadata

**Files:**
- Modify: `src/app/pricing/page.tsx`

- [ ] **Step 1: Update pricing metadata title and description**

Adjust metadata to better reflect commercial search intent around AI prompt manager pricing while staying multi-platform.

- [ ] **Step 2: Keep canonical URL intact**

Preserve the existing canonical URL for `/pricing`.

### Task 2: Add Crawlable Pricing Copy

**Files:**
- Modify: `src/app/pricing/pricing-content.tsx`

- [ ] **Step 1: Add a short explanatory section below the pricing cards**

Include natural keyword-bearing headings:
- `AI prompt manager pricing`
- `Who the free plan is for`
- `Who should upgrade to PromptTray Premium`

- [ ] **Step 2: Keep the positioning multi-platform**

Make sure the copy consistently references PromptTray as working across ChatGPT, Claude, Gemini, and Perplexity rather than framing it as ChatGPT-only.

- [ ] **Step 3: Keep the copy concise and commercial**

Target roughly 150 to 300 words of supporting crawlable text. The content should explain plan fit and upgrade value without feeling like a second landing page.

### Task 3: Verify The Changes

**Files:**
- Modify: `src/app/pricing/page.tsx`
- Modify: `src/app/pricing/pricing-content.tsx`

- [ ] **Step 1: Run lint**

Run:
```bash
npm run lint
```

Expected:
- no new errors from pricing page files

- [ ] **Step 2: Run production build**

Run:
```bash
npm run build
```

Expected:
- build succeeds

- [ ] **Step 3: Final review**

Check:
- pricing page reads naturally
- multi-platform wording is clear
- added copy supports search intent without stuffing
- no unrelated files were changed
