# Premium Version History Design

## Goal

PromptTray needs a paid version history feature that protects Premium users from losing useful prompt edits. The feature should feel like a clear Premium value: prompts can be changed freely, and previous content remains restorable when needed.

The first version should be small, reliable, and easy to explain:

- version history is available only to active Premium users
- PromptTray keeps the last 20 versions per prompt
- downgraded or canceled accounts see history locked immediately
- locked history is retained for 90 days

## Decisions

- Store prompt versions in Supabase, not only in extension local storage.
- Store versions only for active Premium users.
- Save a version only when prompt content changes.
- Do not create versions for title, category, favorite, or avatar-only edits.
- Keep the newest 20 versions per prompt.
- Lock history immediately when Premium is inactive.
- Keep locked history for 90 days so users can reactivate Premium and restore previous versions.
- Restore through a server-side database function so ownership, Premium status, and snapshot behavior stay consistent.

## Product Behavior

Active Premium users get automatic snapshots before prompt content is changed. When they open a prompt, they can view prior versions, preview their content, and restore one.

Free users do not generate stored versions. They can see a locked History entry point so the feature is discoverable at the moment it is relevant.

Canceled, expired, or downgraded users keep their existing stored versions for 90 days, but the history UI is locked. They cannot view or restore previous versions until Premium is active again.

When Premium is reactivated within the retention window, retained history becomes available again. Versions older than the retention window for non-active Premium users can be deleted by scheduled cleanup.

## Limits

Each prompt keeps a maximum of 20 versions.

When a new version is created, cleanup deletes older versions for that prompt beyond the newest 20. This keeps storage predictable while still giving Premium users a useful safety net.

The 20-version limit is per prompt, not per account.

## Extension Sidebar

Add a History button in the prompt editor for existing prompts.

Active Premium state:

- button is enabled
- opens a version history view or panel
- shows a list of previous versions with timestamp and content preview
- each version has a Restore action

Free or inactive Premium state:

- button is locked
- opens a locked state rather than a blank view
- message:
  `Version history is locked. We'll keep your previous versions for 90 days, so you can restore them if you reactivate Premium.`
- CTA routes to the existing upgrade/reactivation flow

Create prompt state:

- history is hidden because a new prompt has no previous versions yet

## Restore Behavior

Restoring a version should be reversible.

Before applying the selected version, PromptTray snapshots the prompt's current content as a new version when the account is active Premium. Then the selected version replaces the prompt's current content and updates the prompt timestamp.

The restore action should ask for confirmation:

`Restore this version? Your current prompt will be saved as a new version first.`

If the user is no longer active Premium when they click Restore, the restore is rejected and the locked state is shown.

## Data Model

Add a `public.prompt_versions` table.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `prompt_id uuid not null references public.prompts(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `title text not null`
- `content text not null`
- `created_at timestamptz not null default now()`
- `created_from text not null default 'edit'`

`created_from` should allow values such as:

- `edit`
- `restore`

Recommended indexes:

- `(user_id, prompt_id, created_at desc)`
- `(user_id, created_at)`

## Security

RLS must be enabled on `public.prompt_versions`.

Users can only select their own prompt versions when they are active Premium.

Version inserts should not be exposed as a broad client-side write path if avoidable. Prefer RPC functions that check:

- the authenticated user owns the prompt
- the authenticated user is active Premium
- the version content is non-empty

Restore must be handled by an RPC function, not by separate client-side reads and writes.

## Database Functions

Add a function for snapshot creation, for example `public.create_prompt_version(...)`.

Responsibilities:

- confirm active Premium
- confirm prompt ownership
- insert the previous prompt title/content
- prune versions beyond the newest 20 for that prompt

Add a function for restore, for example `public.restore_prompt_version(version_id uuid)`.

Responsibilities:

- confirm active Premium
- confirm the version belongs to the authenticated user
- confirm the related prompt belongs to the authenticated user
- snapshot the prompt's current title/content with `created_from = 'restore'`
- update the prompt with the selected version's title/content
- prune versions beyond the newest 20 for that prompt
- return the restored prompt row

Add a cleanup function or scheduled query for retention:

- find users who are not active Premium
- delete their prompt versions older than 90 days

## Sync Flow

The extension already updates local prompts first and syncs prompt upserts to Supabase.

For Premium version history, the sync layer should snapshot the remote prompt before updating its remote content. This avoids trusting local storage as the source of historical truth.

Recommended edit flow:

1. Extension updates local prompt content.
2. Extension sends prompt upsert to the background service worker.
3. Service worker checks account/session as it does today.
4. Remote upsert path calls the snapshot function before changing content when the remote prompt already exists and content changed.
5. Remote prompt is updated.
6. Local prompt keeps its existing sync behavior.

If the account is Free or inactive Premium, the snapshot function returns a handled locked-history response. Prompt editing itself must still work.

## Error Handling

Prompt editing must not fail just because version history fails.

If snapshot creation fails for a transient reason, the prompt update can still continue and the extension should avoid noisy user-facing errors. Log the failure for debugging.

Restore is different: if restore fails, the prompt should not be changed and the user should see a concise warning.

If a user opens History while offline or without a valid session, show a retryable empty/error state rather than implying no versions exist.

## Testing

Database tests or manual SQL verification should cover:

- Free users cannot create versions.
- Active Premium users can create versions.
- Users cannot read another user's versions.
- Restore snapshots the current content before applying the selected version.
- More than 20 versions prunes the oldest versions.
- Inactive Premium users cannot restore.
- Versions older than 90 days for inactive Premium users can be deleted by cleanup.

Extension tests should cover pure helper behavior if version state, labels, or locked copy are extracted into helpers.

Manual verification should cover:

- Free editor shows locked History state.
- Premium editor shows History for existing prompts.
- Editing prompt content creates a previous version.
- Editing title/category/avatar only does not create a version.
- Restoring a version updates prompt content.
- Downgraded state shows the 90-day locked message.

## Out Of Scope

- Diff view between versions.
- Named versions.
- Version history for categories.
- Version history for avatars.
- Account-wide history timeline.
- User-configurable retention.
- Local-only history for anonymous users.
- Unlimited version storage.
