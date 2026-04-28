# Upgrade Paywall UI Design

## Goal

PromptTray needs visible upgrade/paywall UI in two places:

- the Chrome extension sidebar settings
- the web account dashboard

The UI makes Free plan limits discoverable, encourages Premium upgrade at the right moment, and avoids making the product feel like a billing screen. Upgrade actions route through a configurable checkout URL so a payment provider can be connected later without redesigning the product surfaces.

## Decisions

- Use a quiet persistent plan surface plus stronger limit-state nudges.
- Add an Upgrade button in extension settings.
- Add an Upgrade button in the web dashboard.
- Send upgrade actions to a configurable checkout URL.
- If no checkout URL is configured, fall back to a safe PromptTray support/account URL.
- Do not add a payment-provider integration in this work.
- Do not add new billing database schema in this work.

## Product Behavior

Free users see their current plan and usage before they hit a wall. The upgrade prompt becomes more direct only when usage is close to a Free limit or already blocked by it.

Premium users see confirmation that their plan is active and that prompts/categories are unlimited. They do not see Upgrade buttons.

Unauthenticated extension users continue to see account creation and login actions. They do not see upgrade UI until they are logged in, because plan and usage are tied to account sync.

## Extension Sidebar

Add a Plan section near the existing Account section in the settings view.

For authenticated Free users, the section shows:

- `Free plan`
- prompt usage, formatted as `x/30 prompts`
- category usage, formatted as `y/5 categories`
- concise Premium value copy
- an `Upgrade` button

The section changes tone based on usage:

- Normal: quiet plan status and upgrade option.
- Near limit: copy says the user is close to the Free limit.
- At limit: copy says the Free limit is reached and Premium unlocks unlimited prompts/categories.

Thresholds:

- Prompt near limit: `>= 24/30`
- Prompt at limit: `>= 30/30`
- Category near limit: `>= 4/5`
- Category at limit: `>= 5/5`

The settings Upgrade button opens the configured checkout URL in a new tab. It follows the extension's existing external navigation pattern: the sidebar sends a runtime message and the service worker opens a tab.

## Web Dashboard

Refine the current dashboard usage area into a clearer Plan & usage surface.

For Free users, the dashboard shows:

- current plan label
- prompt usage, formatted as `x/30`
- category usage, formatted as `y/5`
- warning copy when near or at limits
- an `Upgrade` button

For Premium users, the dashboard shows:

- `Premium`
- unlimited prompt/category state
- no upgrade CTA

The dashboard Upgrade button uses a billing helper that returns the configured checkout URL or a safe fallback URL.

## Checkout URL Configuration

The web app and extension need parallel helpers because the extension cannot import from the Next.js app.

Web app:

- Add `src/lib/billing.ts`.
- Read the checkout URL from `NEXT_PUBLIC_UPGRADE_CHECKOUT_URL`.
- Return the configured checkout URL when it is a valid URL.
- Fall back to `${getSiteUrl()}/support`.

Extension:

- Add `UPGRADE_CHECKOUT_URL` to `src/utils/constants.js`.
- Add a background message handler such as `prompttray:upgrade:open`.
- Return the configured checkout URL when it is present and valid.
- Fall back to `${WEBSITE_AUTH_ORIGIN}/support`.

Fallback behavior must never produce a broken or empty link.

## Component Boundaries

Extension:

- Add a sidebar render helper for the plan section.
- Add a click action for upgrade.
- Add CSS for the plan card, usage rows/bars, and warning state.
- Reuse existing settings layout conventions.

Dashboard:

- Keep the dashboard server-rendered.
- Reuse existing Supabase queries for prompts, categories, and entitlement.
- Reuse existing Button, Link, and Tailwind conventions.
- Keep changes scoped to the dashboard/account plan display and billing helper.

## Error Handling

If plan data is missing or entitlement fetch fails, the existing product behavior treats the user as Free. The paywall UI does the same.

If the checkout URL is absent, upgrade clicks open the fallback destination.

If usage counts are unavailable in the extension, the section does not show progress bars and still shows the current plan label.

## Testing

Extension verification:

- Keep existing `plan-limits.test.js` as the enforcement coverage.
- Add tests only if threshold/status logic is extracted into a pure helper.
- Run the extension Node tests.

Web app verification:

- Run `npm run lint`.
- Confirm Free dashboard renders an Upgrade button.
- Confirm Premium dashboard renders unlimited state without an Upgrade button.

## Out Of Scope

- Real checkout provider integration.
- Webhook handling.
- Subscription management portal.
- Billing history.
- Plan changes in Supabase from checkout completion.
- New pricing page.
