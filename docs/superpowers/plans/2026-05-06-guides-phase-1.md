# PromptTray Guides Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the first three SEO guide pages for PromptTray with strong metadata, internal linking, and sitemap coverage.

**Architecture:** Add a small reusable guide-page presentation layer, create three App Router guide routes with query-specific content, and include the new guide URLs in the sitemap. Content drafting happens in parallel, while implementation and final consistency review happen locally.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, existing landing typography/styles

---

### Task 1: Prepare The Shared Guide Page Structure

**Files:**
- Create: `src/components/guides/guide-shell.tsx`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Create the shared guide shell component**

Create a reusable page shell that matches the site’s existing editorial style and supports:
- title
- description
- last updated label
- main content body
- FAQ block
- CTA block
- related links block

Use the existing `PromptTrayLogo`, `Button`, and `Link` patterns from landing/legal pages.

- [ ] **Step 2: Keep guide layout text-first and SEO-friendly**

The shared shell should render:
- one `<h1>`
- semantic `<section>` blocks
- readable prose containers
- a small top nav back to homepage
- footer links to pricing/support/privacy/terms

- [ ] **Step 3: Update sitemap planning target**

Prepare `src/app/sitemap.ts` to include:
- `/guides/save-prompts-in-chatgpt`
- `/guides/organize-ai-prompts`
- `/guides/manage-prompts-across-ai-tools`

- [ ] **Step 4: Verify no unrelated files are changed in this task**

Run:
```bash
git status --short
```

Expected:
- new guide-related files only from this task

### Task 2: Implement The ChatGPT Prompt Saving Guide

**Files:**
- Create: `src/app/guides/save-prompts-in-chatgpt/page.tsx`
- Modify: `src/components/guides/guide-shell.tsx`

- [ ] **Step 1: Draft the page metadata**

Add metadata aligned to the primary query:
- title around `How to Save Prompts in ChatGPT`
- description focused on saving, organizing, and reusing prompts with PromptTray
- canonical URL for `/guides/save-prompts-in-chatgpt`

- [ ] **Step 2: Implement the page content**

Include:
- a direct intro answering how to save prompts in ChatGPT
- practical sections covering why chat history is weak for prompt reuse, manual options, and a better workflow
- PromptTray as the practical workflow upgrade
- 3 to 5 FAQ items
- links to `/pricing`, `/support`, homepage, and related guides

- [ ] **Step 3: Verify the page compiles cleanly**

Run:
```bash
npm run lint
```

Expected:
- no new errors from `src/app/guides/save-prompts-in-chatgpt/page.tsx`

### Task 3: Implement The AI Prompt Organization Guide

**Files:**
- Create: `src/app/guides/organize-ai-prompts/page.tsx`
- Modify: `src/components/guides/guide-shell.tsx`

- [ ] **Step 1: Draft the page metadata**

Add metadata aligned to the primary query:
- title around `How to Organize AI Prompts`
- description focused on categories, prompt libraries, searchability, and reuse
- canonical URL for `/guides/organize-ai-prompts`

- [ ] **Step 2: Implement the page content**

Include:
- a direct intro answering how to organize AI prompts
- sections for naming, categories, prompt templates, reuse habits, and maintaining a prompt library
- PromptTray as the productized workflow
- 3 to 5 FAQ items
- links to `/pricing`, `/support`, homepage, and related guides

- [ ] **Step 3: Verify the page compiles cleanly**

Run:
```bash
npm run lint
```

Expected:
- no new errors from `src/app/guides/organize-ai-prompts/page.tsx`

### Task 4: Implement The Multi-Tool Prompt Management Guide

**Files:**
- Create: `src/app/guides/manage-prompts-across-ai-tools/page.tsx`
- Modify: `src/components/guides/guide-shell.tsx`

- [ ] **Step 1: Draft the page metadata**

Add metadata aligned to the primary query:
- title around `Best Way to Manage Prompts Across ChatGPT, Claude, and Gemini`
- description focused on cross-tool prompt management and one shared prompt library
- canonical URL for `/guides/manage-prompts-across-ai-tools`

- [ ] **Step 2: Implement the page content**

Include:
- a direct intro answering the multi-tool workflow question
- sections on fragmentation problems, cross-tool consistency, workflow setup, and reuse
- PromptTray as the central prompt manager
- 3 to 5 FAQ items
- links to `/pricing`, `/support`, homepage, and related guides

- [ ] **Step 3: Verify the page compiles cleanly**

Run:
```bash
npm run lint
```

Expected:
- no new errors from `src/app/guides/manage-prompts-across-ai-tools/page.tsx`

### Task 5: Final Integration And Verification

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: any new guide files from Tasks 1-4 only if consistency fixes are needed

- [ ] **Step 1: Normalize cross-linking and CTA consistency**

Ensure each guide includes:
- homepage link
- pricing link
- support link
- links to the other two guides

- [ ] **Step 2: Verify sitemap entries**

Run:
```bash
sed -n '1,220p' src/app/sitemap.ts
```

Expected:
- all three guide URLs are present

- [ ] **Step 3: Run lint**

Run:
```bash
npm run lint
```

Expected:
- no new errors
- unrelated pre-existing warnings may remain

- [ ] **Step 4: Run production build**

Run:
```bash
npm run build
```

Expected:
- build succeeds
- guide routes appear in generated route output

- [ ] **Step 5: Final review**

Check:
- H1 matches primary query on each page
- intro answers intent quickly
- content stays text-only
- no placeholder guide copy remains
- no extra guide or comparison routes were added
