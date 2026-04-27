# Prompt Thumbnail Upload Design

## Overview

PromptTray will support optional prompt avatars for both Free and Premium users. A prompt avatar can be empty, an emoji, or an uploaded image. Empty is the default state; users decide when a prompt needs a visual marker.

The avatar is shown as a circular image or emoji in prompt list rows and is editable from the prompt create/edit form. Uploaded image avatars sync with the user's account-backed prompts so they follow the prompt across devices.

## Goals

- Let users attach a small circular visual identity to any saved prompt.
- Support both emoji avatars and uploaded image avatars.
- Keep the feature available to Free and Premium plans without adding a new plan limit.
- Optimize uploaded images automatically before account sync.
- Preserve avatar metadata through local storage, import/export, Supabase sync, and remote restore.

## Non-Goals

- Build a reusable media library.
- Allow multiple thumbnails per prompt.
- Add plan-based thumbnail quotas in the first version.
- Support animated thumbnail playback. Animated input files may be accepted, but output thumbnails are static.

## User Experience

Prompt rows show no avatar by default. When a prompt has an avatar, the row renders a fixed-size circular slot beside the prompt content:

- Emoji avatars render as centered emoji inside the circle.
- Image avatars render as a cropped circular image.
- Missing or failed image loads fall back to no visible avatar.

The create/edit prompt form adds an optional Avatar section. Users can:

- Choose an emoji.
- Upload an image.
- Replace the current avatar.
- Remove the avatar.

The editor uses the same single avatar state for emoji and image choices. Choosing an emoji replaces any image avatar. Uploading an image replaces any emoji avatar.

## Data Model

Local prompt objects gain optional avatar fields:

```json
{
  "avatarType": "emoji | image | null",
  "avatarEmoji": "string | null",
  "avatarImagePath": "string | null",
  "avatarImageUrl": "string | null"
}
```

`avatarImagePath` is the durable source of truth for synced uploaded images. `avatarImageUrl` is a runtime/display helper and should not be required for import/export correctness.

Supabase `public.prompts` gains nullable columns:

```sql
avatar_type text null check (avatar_type in ('emoji', 'image')),
avatar_emoji text null,
avatar_image_path text null
```

The app also needs a user-scoped storage bucket for prompt avatar files. Storage paths should include the authenticated user id and prompt id, for example:

```text
prompt-avatars/{user_id}/{prompt_id}/avatar.webp
```

Storage policies must ensure users can read, create, update, and delete only their own avatar objects.

## Image Validation And Optimization

The extension optimizes images before upload:

- Accepted input types: PNG, JPEG, WebP, and GIF.
- Minimum useful source size: 128x128 pixels.
- Target output size: 256x256 pixels.
- Output format: WebP when supported, otherwise JPEG.
- Target optimized size: 150-250 KB.
- Crop behavior: center crop to square.

The optimization path loads the image into a canvas, draws a centered square crop, and exports a compressed static thumbnail. This naturally strips metadata. If the image cannot be decoded, is below the minimum size, or cannot be compressed, the user sees a warning and the existing avatar remains unchanged.

## Sync Flow

Prompt upsert sync includes avatar metadata with the existing prompt payload. Remote-to-local restore maps Supabase avatar fields back onto local prompt objects.

When creating a new prompt with an image avatar, the extension saves the prompt locally first, then uploads the optimized avatar with the prompt id in the storage path, then updates and syncs the prompt avatar metadata.

When editing an existing prompt:

- Emoji selection updates prompt metadata only.
- Image selection uploads the optimized file, updates `avatarType` and `avatarImagePath`, and syncs the prompt.
- Removing an avatar clears avatar metadata and syncs the prompt.
- Replacing or removing an image attempts to delete the old storage object after the prompt update succeeds.

When deleting a prompt, the extension deletes the prompt row and attempts to delete the prompt's uploaded avatar object. Storage cleanup failures should be logged but should not block prompt deletion.

## Import And Export

JSON export includes avatar metadata. Emoji avatars round-trip fully. Image avatars export the storage path metadata, not binary image data.

On import:

- Emoji avatar metadata is preserved.
- Image avatar metadata is preserved when present.
- Invalid avatar metadata is normalized to no avatar.

## Dashboard

The account dashboard should request avatar fields with synced prompts. In the first version, it can show the circular avatar in read-only prompt snapshots. The extension remains the primary place for creating and editing avatars.

## Error Handling

- Too-small image: show a clear warning and keep the previous avatar.
- Unsupported or unreadable image: show a clear warning and keep the previous avatar.
- Upload failure: keep the prompt saved, leave the previous avatar unchanged, and show an upload warning.
- Sync failure after local update: follow the existing sync error pattern and keep local data available.
- Image load failure in list UI: hide the avatar image without breaking the row.

## Testing

Implementation should be test-first. Coverage should include:

- Prompt normalization for empty, emoji, and image avatars.
- Import/export round trips for avatar metadata.
- Supabase prompt mapping for avatar fields.
- Remote restore preserving avatar metadata.
- Image validation and optimization helpers.
- Editor behavior for choosing emoji, uploading image, replacing avatar, and removing avatar.
- Prompt row rendering with no avatar, emoji avatar, and image avatar.

## Open Decisions

None. Version 1 uses an optional prompt-level avatar with synced emoji or optimized uploaded image support for both Free and Premium users.
