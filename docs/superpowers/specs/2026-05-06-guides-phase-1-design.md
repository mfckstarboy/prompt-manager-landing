# PromptTray Guides Phase 1 Design

## Goal

Create the first three text-only SEO guide pages for PromptTray so the site starts ranking for high-intent prompt-management queries beyond the homepage, pricing, and support pages.

## Scope

This phase includes three guide pages only:

- `/guides/save-prompts-in-chatgpt`
- `/guides/organize-ai-prompts`
- `/guides/manage-prompts-across-ai-tools`

This phase does not include screenshots, a blog index, comparison pages, or additional guide pages beyond these three.

## Why These Pages

These three routes match the highest-priority Phase 2 topics in the SEO Improvement Plan and cover a balanced mix of intent:

- task intent: how to save prompts in ChatGPT
- workflow intent: how to organize AI prompts
- cross-tool intent: how to manage prompts across ChatGPT, Claude, and Gemini

Together they give PromptTray a stronger topical footprint around prompt storage, prompt organization, and multi-tool prompt workflows.

## Page Requirements

Each page should:

- target one primary query with a matching H1
- include 600 to 1200 words of crawlable text
- answer the main query clearly in the opening section
- include practical steps, examples, or workflow guidance
- include a short FAQ section
- include a soft CTA back to PromptTray
- link to `/`, `/pricing`, `/support`, and the related guide pages where relevant
- use metadata aligned to the target query

Each page should stay helpful and product-relevant without turning into thin sales copy. The content should educate first and position PromptTray as the practical next step.

## Information Architecture

New route structure:

- `src/app/guides/save-prompts-in-chatgpt/page.tsx`
- `src/app/guides/organize-ai-prompts/page.tsx`
- `src/app/guides/manage-prompts-across-ai-tools/page.tsx`

Supporting implementation updates:

- add these guide URLs to `src/app/sitemap.ts`
- add internal links between the guides and existing core pages

No dedicated guide index page is required in this phase.

## Content Structure

Each guide should follow a consistent structure:

1. SEO-focused hero
- H1 aligned to the target query
- direct intro paragraph that answers the search intent fast

2. Main educational sections
- explanation of the problem
- practical method or workflow
- examples where useful
- prompts or organization tips where useful

3. PromptTray positioning
- explain how PromptTray helps with the workflow
- keep this grounded and useful, not overly promotional

4. FAQ
- 3 to 5 concise questions based on likely search follow-ups

5. CTA
- link to homepage and pricing

## Writing Direction

Tone should be:

- clear
- specific
- practical
- light on hype
- aligned with the homepage voice

SEO direction should prioritize:

- extractable answer blocks
- keyword-aligned headings
- readable paragraphs
- internal linking
- query coverage without stuffing

## Implementation Approach

We will use parallel agents to draft the three guides independently, since the topics are related but the content files are separate and can be written without shared-state conflicts.

Controller responsibilities:

- provide route, target query, and content expectations to each agent
- review all drafts for quality and consistency
- normalize formatting, internal links, and CTA treatment
- implement the pages in the app router
- update the sitemap
- run lint and build verification

## Risks And Mitigations

Risk: guides feel repetitive
- Mitigation: give each page a distinct query, angle, and examples

Risk: pages become too sales-heavy
- Mitigation: keep product mentions useful and secondary to the educational answer

Risk: pages are too thin for indexing
- Mitigation: require full sections, FAQs, and practical content depth per page

Risk: inconsistent voice across agent drafts
- Mitigation: review and harmonize all content before shipping

## Success Criteria

This phase is complete when:

- all three guide routes exist and render successfully
- each page has metadata and internal links
- the sitemap includes the three guides
- the content is text-only, helpful, and SEO-focused
- build and lint checks pass aside from any unrelated pre-existing warnings
