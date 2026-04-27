# Free/Premium Plan Limits Design

## Goal

PromptTray needs production-ready Free/Premium plan detection and usage limits. Free users can save up to 30 prompts and create up to 5 categories. Premium users have unlimited prompts and categories.

## Source Of Truth

Supabase is the authoritative source for plan state. A new `public.user_entitlements` table stores provider-neutral subscription state so Dodo Payments or another provider can update the same record later.

A user is Premium only when they have an entitlement row with `plan = 'premium'` and `status = 'active'`. Users without an active Premium entitlement are treated as Free.

## Data Model

`public.user_entitlements` contains:

- `user_id`
- `plan`
- `status`
- `provider`
- `provider_customer_id`
- `provider_subscription_id`
- `current_period_end`
- `created_at`
- `updated_at`

The entitlement table is intentionally provider-neutral. Dodo Payments integration can update this table from a verified webhook without changing extension or dashboard limit logic.

## Enforcement

Supabase enforces limits with helper functions and insert triggers:

- `public.is_premium_user(uuid)` returns true for active Premium users.
- `public.get_user_plan(uuid)` returns `premium` or `free`.
- `public.enforce_prompt_limit()` blocks Free prompt inserts above 30.
- `public.enforce_category_limit()` blocks Free category inserts above 5.

Updates and deletes remain allowed because the limit only controls creation.

## Extension Behavior

The extension mirrors limits locally so users get immediate feedback:

- New prompt creation is blocked at 30 for Free users.
- New category creation is blocked at 5 for Free users.
- Reusing an existing category remains allowed.
- Editing, deleting, favoriting, and clearing prompts remain allowed.
- Import only imports as many new prompts and new categories as the Free plan can still accept.

The extension keeps `plan`, `promptLimit`, and `categoryLimit` in settings. On login and sync it asks the background service worker to fetch the current entitlement from Supabase.

## Dashboard Behavior

The web dashboard shows the current plan and usage:

- Free users see `x/30` prompts and `y/5` categories.
- Premium users see unlimited usage.

## Error Handling

If entitlement fetch fails, the product falls back to Free limits. If Supabase rejects a sync insert because a limit is exceeded, sync status becomes `error` and the local UI continues using the local limit checks.

## Testing

The extension limit rules live in a pure helper with Node tests. Web app verification uses `npm run lint`. SQL is reviewed statically and should be applied in Supabase before production release.
