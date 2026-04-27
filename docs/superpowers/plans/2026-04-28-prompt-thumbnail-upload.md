# Prompt Thumbnail Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add synced optional circular prompt avatars with emoji or optimized uploaded image support for both Free and Premium users.

**Architecture:** The extension stores normalized avatar metadata on prompt objects, optimizes image uploads in a focused helper, and delegates Supabase Storage upload/delete work to the background service worker. Supabase stores durable avatar metadata on `public.prompts` and avatar files in a user-scoped storage bucket. The dashboard reads and renders avatar metadata as a read-only prompt snapshot.

**Tech Stack:** Chrome extension plain JavaScript, Node built-in test runner, Canvas APIs in content scripts, Supabase PostgREST and Storage REST APIs, Supabase SQL/RLS, Next.js 16 Server Components.

---

## File Structure

- Create `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/prompt-avatar.js`: pure avatar normalization, prompt payload mapping, avatar row markup helpers, and CommonJS exports for tests.
- Create `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/image-optimizer.js`: browser image validation and canvas optimization helper.
- Create `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/prompt-avatar.test.js`: tests for avatar normalization, import/export-safe prompt normalization, and remote/local mapping.
- Create `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/image-optimizer.test.js`: tests for validation boundaries and optimizer failure behavior that can run without a browser canvas.
- Modify `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/storage/prompt-store.js`: preserve avatar metadata on create, update, save, import, and sync notifications.
- Modify `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/background/service-worker.js`: map avatar fields to Supabase, upload/delete optimized avatar files, and restore avatar metadata.
- Modify `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/content/sidebar.js`: add editor avatar controls, prompt-row circular avatar rendering, image optimization calls, and upload/remove actions.
- Modify `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/content/save-modal.js`: preserve empty avatar defaults for quick-save prompts.
- Modify `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/styles/content.css`: add circular avatar and editor picker styles.
- Modify `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.json`, `manifest.dev.json`, and `manifest.prod.json`: load the new utility scripts before store/sidebar scripts.
- Modify `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/supabase/mvp-prompts.sql`: add prompt avatar columns, storage bucket, and storage policies.
- Modify `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/src/app/app/page.tsx`: query and render read-only prompt avatars.

---

### Task 1: Add Pure Avatar Metadata Helper

**Files:**
- Create: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/prompt-avatar.js`
- Create: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/prompt-avatar.test.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.json`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.dev.json`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.prod.json`

- [ ] **Step 1: Write failing avatar helper tests**

Create `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/prompt-avatar.test.js`:

```javascript
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildLocalAvatarFromRemote,
  buildRemoteAvatarPayload,
  normalizePromptAvatar,
  renderPromptAvatarMarkup
} = require("../src/utils/prompt-avatar.js");

test("normalizes empty avatar metadata to null fields", () => {
  assert.deepEqual(normalizePromptAvatar({}), {
    avatarType: null,
    avatarEmoji: null,
    avatarImagePath: null,
    avatarImageUrl: null
  });
});

test("normalizes emoji avatar metadata", () => {
  assert.deepEqual(normalizePromptAvatar({ avatarType: "emoji", avatarEmoji: "🔥" }), {
    avatarType: "emoji",
    avatarEmoji: "🔥",
    avatarImagePath: null,
    avatarImageUrl: null
  });
});

test("normalizes image avatar metadata", () => {
  assert.deepEqual(
    normalizePromptAvatar({
      avatarType: "image",
      avatarEmoji: "🔥",
      avatarImagePath: "prompt-avatars/user-1/prompt-1/avatar.webp",
      avatarImageUrl: "blob:preview"
    }),
    {
      avatarType: "image",
      avatarEmoji: null,
      avatarImagePath: "prompt-avatars/user-1/prompt-1/avatar.webp",
      avatarImageUrl: "blob:preview"
    }
  );
});

test("rejects invalid avatar metadata", () => {
  assert.deepEqual(
    normalizePromptAvatar({
      avatarType: "image",
      avatarImagePath: ""
    }),
    {
      avatarType: null,
      avatarEmoji: null,
      avatarImagePath: null,
      avatarImageUrl: null
    }
  );
});

test("builds remote payload with snake case fields", () => {
  assert.deepEqual(
    buildRemoteAvatarPayload({
      avatarType: "emoji",
      avatarEmoji: "✨",
      avatarImagePath: "ignored"
    }),
    {
      avatar_type: "emoji",
      avatar_emoji: "✨",
      avatar_image_path: null
    }
  );
});

test("builds local metadata from remote prompt fields", () => {
  assert.deepEqual(
    buildLocalAvatarFromRemote({
      avatar_type: "image",
      avatar_emoji: null,
      avatar_image_path: "prompt-avatars/user-1/prompt-1/avatar.webp"
    }),
    {
      avatarType: "image",
      avatarEmoji: null,
      avatarImagePath: "prompt-avatars/user-1/prompt-1/avatar.webp",
      avatarImageUrl: null
    }
  );
});

test("renders no avatar markup when empty", () => {
  assert.equal(renderPromptAvatarMarkup({}, (value) => value), "");
});

test("renders escaped emoji avatar markup", () => {
  assert.equal(
    renderPromptAvatarMarkup({ avatarType: "emoji", avatarEmoji: "<" }, (value) =>
      String(value).replaceAll("<", "&lt;")
    ),
    '<span class="po-prompt-avatar po-prompt-avatar--emoji" aria-hidden="true">&lt;</span>'
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: FAIL with `Cannot find module '../src/utils/prompt-avatar.js'`.

- [ ] **Step 3: Implement the avatar helper**

Create `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/prompt-avatar.js`:

```javascript
(function initPromptAvatar(global) {
  const namespace = global.PromptOrganizer || (global.PromptOrganizer = {});

  function cleanString(value) {
    const trimmed = String(value || "").trim();
    return trimmed || null;
  }

  function normalizePromptAvatar(source) {
    const avatarType = cleanString(source?.avatarType || source?.avatar_type);

    if (avatarType === "emoji") {
      const avatarEmoji = cleanString(source?.avatarEmoji || source?.avatar_emoji);
      return {
        avatarType: avatarEmoji ? "emoji" : null,
        avatarEmoji,
        avatarImagePath: null,
        avatarImageUrl: null
      };
    }

    if (avatarType === "image") {
      const avatarImagePath = cleanString(source?.avatarImagePath || source?.avatar_image_path);
      return {
        avatarType: avatarImagePath ? "image" : null,
        avatarEmoji: null,
        avatarImagePath,
        avatarImageUrl: avatarImagePath ? cleanString(source?.avatarImageUrl || source?.avatar_image_url) : null
      };
    }

    return {
      avatarType: null,
      avatarEmoji: null,
      avatarImagePath: null,
      avatarImageUrl: null
    };
  }

  function buildRemoteAvatarPayload(prompt) {
    const avatar = normalizePromptAvatar(prompt);
    return {
      avatar_type: avatar.avatarType,
      avatar_emoji: avatar.avatarType === "emoji" ? avatar.avatarEmoji : null,
      avatar_image_path: avatar.avatarType === "image" ? avatar.avatarImagePath : null
    };
  }

  function buildLocalAvatarFromRemote(prompt) {
    return normalizePromptAvatar({
      avatarType: prompt?.avatar_type,
      avatarEmoji: prompt?.avatar_emoji,
      avatarImagePath: prompt?.avatar_image_path
    });
  }

  function renderPromptAvatarMarkup(prompt, escapeHtml) {
    const avatar = normalizePromptAvatar(prompt);

    if (avatar.avatarType === "emoji") {
      return `<span class="po-prompt-avatar po-prompt-avatar--emoji" aria-hidden="true">${escapeHtml(avatar.avatarEmoji)}</span>`;
    }

    if (avatar.avatarType === "image") {
      const src = avatar.avatarImageUrl || avatar.avatarImagePath;
      return `<span class="po-prompt-avatar po-prompt-avatar--image" aria-hidden="true"><img src="${escapeHtml(src)}" alt="" loading="lazy" /></span>`;
    }

    return "";
  }

  const api = {
    buildLocalAvatarFromRemote,
    buildRemoteAvatarPayload,
    normalizePromptAvatar,
    renderPromptAvatarMarkup
  };

  namespace.promptAvatar = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : global);
```

- [ ] **Step 4: Load the helper in extension manifests**

In `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.json`, `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.dev.json`, and `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.prod.json`, add this script after `"src/utils/plan-limits.js"` and before `"src/utils/dom.js"`:

```json
"src/utils/prompt-avatar.js",
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS for `plan-limits.test.js` and `prompt-avatar.test.js`.

---

### Task 2: Add Image Validation And Optimization Helper

**Files:**
- Create: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/image-optimizer.js`
- Create: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/image-optimizer.test.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.json`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.dev.json`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/manifest.prod.json`

- [ ] **Step 1: Write failing validation tests**

Create `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/image-optimizer.test.js`:

```javascript
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  IMAGE_AVATAR_LIMITS,
  getImageValidationError,
  getPreferredAvatarMimeType
} = require("../src/utils/image-optimizer.js");

test("accepts supported image file types", () => {
  assert.equal(getImageValidationError({ type: "image/png", size: 1000 }), "");
  assert.equal(getImageValidationError({ type: "image/jpeg", size: 1000 }), "");
  assert.equal(getImageValidationError({ type: "image/webp", size: 1000 }), "");
  assert.equal(getImageValidationError({ type: "image/gif", size: 1000 }), "");
});

test("rejects unsupported files", () => {
  assert.equal(getImageValidationError({ type: "application/pdf", size: 1000 }), "Choose a PNG, JPEG, WebP, or GIF image.");
});

test("rejects empty files", () => {
  assert.equal(getImageValidationError({ type: "image/png", size: 0 }), "Choose an image file to upload.");
});

test("rejects files above the source upload limit", () => {
  assert.equal(
    getImageValidationError({ type: "image/png", size: IMAGE_AVATAR_LIMITS.maxSourceBytes + 1 }),
    "Choose an image smaller than 8 MB."
  );
});

test("prefers webp when canvas supports it", () => {
  const canvas = {
    toDataURL(type) {
      return type === "image/webp" ? "data:image/webp;base64,abc" : "data:image/png;base64,abc";
    }
  };

  assert.equal(getPreferredAvatarMimeType(canvas), "image/webp");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: FAIL with `Cannot find module '../src/utils/image-optimizer.js'`.

- [ ] **Step 3: Implement validation and optimization helper**

Create `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/utils/image-optimizer.js`:

```javascript
(function initImageOptimizer(global) {
  const namespace = global.PromptOrganizer || (global.PromptOrganizer = {});

  const IMAGE_AVATAR_LIMITS = {
    maxSourceBytes: 8 * 1024 * 1024,
    minSourcePixels: 128,
    outputPixels: 256,
    quality: 0.86
  };
  const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

  function getImageValidationError(file) {
    if (!file || !Number(file.size)) {
      return "Choose an image file to upload.";
    }

    if (!SUPPORTED_IMAGE_TYPES.has(String(file.type || "").toLowerCase())) {
      return "Choose a PNG, JPEG, WebP, or GIF image.";
    }

    if (file.size > IMAGE_AVATAR_LIMITS.maxSourceBytes) {
      return "Choose an image smaller than 8 MB.";
    }

    return "";
  }

  function getPreferredAvatarMimeType(canvas) {
    try {
      return canvas.toDataURL("image/webp").startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
    } catch {
      return "image/jpeg";
    }
  }

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Unable to read this image."));
      };
      image.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Unable to optimize this image."));
          return;
        }
        resolve(blob);
      }, type, quality);
    });
  }

  async function optimizeAvatarImage(file) {
    const validationError = getImageValidationError(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const image = await loadImageFromFile(file);
    const width = Number(image.naturalWidth || image.width);
    const height = Number(image.naturalHeight || image.height);

    if (width < IMAGE_AVATAR_LIMITS.minSourcePixels || height < IMAGE_AVATAR_LIMITS.minSourcePixels) {
      throw new Error("Choose an image at least 128 × 128 pixels.");
    }

    const sourceSize = Math.min(width, height);
    const sourceX = Math.floor((width - sourceSize) / 2);
    const sourceY = Math.floor((height - sourceSize) / 2);
    const canvas = document.createElement("canvas");
    canvas.width = IMAGE_AVATAR_LIMITS.outputPixels;
    canvas.height = IMAGE_AVATAR_LIMITS.outputPixels;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to optimize this image.");
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      IMAGE_AVATAR_LIMITS.outputPixels,
      IMAGE_AVATAR_LIMITS.outputPixels
    );

    const type = getPreferredAvatarMimeType(canvas);
    const blob = await canvasToBlob(canvas, type, IMAGE_AVATAR_LIMITS.quality);

    return {
      blob,
      extension: type === "image/webp" ? "webp" : "jpg",
      mimeType: type,
      objectUrl: URL.createObjectURL(blob)
    };
  }

  const api = {
    IMAGE_AVATAR_LIMITS,
    getImageValidationError,
    getPreferredAvatarMimeType,
    optimizeAvatarImage
  };

  namespace.imageOptimizer = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : global);
```

- [ ] **Step 4: Load the helper in extension manifests**

In all three extension manifests, add this script after `"src/utils/prompt-avatar.js"` and before `"src/utils/dom.js"`:

```json
"src/utils/image-optimizer.js",
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS for all extension tests.

- [ ] **Step 6: Commit**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git status --short
```

Expected: no new landing-repo changes from this task unless the plan file was not committed earlier.

---

### Task 3: Preserve Avatar Metadata In Extension Store

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/storage/prompt-store.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/content/save-modal.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/prompt-avatar.test.js`

- [ ] **Step 1: Add failing tests for prompt avatar normalization behavior**

Append to `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/prompt-avatar.test.js`:

```javascript
test("normalizes prompt data with avatar fields for storage", () => {
  const avatar = normalizePromptAvatar({
    avatarType: "emoji",
    avatarEmoji: "🧠",
    avatarImagePath: "ignored"
  });

  assert.deepEqual(avatar, {
    avatarType: "emoji",
    avatarEmoji: "🧠",
    avatarImagePath: null,
    avatarImageUrl: null
  });
});

test("image avatar export metadata does not require runtime url", () => {
  const avatar = normalizePromptAvatar({
    avatarType: "image",
    avatarImagePath: "prompt-avatars/user-1/prompt-1/avatar.webp"
  });

  assert.equal(avatar.avatarImageUrl, null);
  assert.equal(avatar.avatarImagePath, "prompt-avatars/user-1/prompt-1/avatar.webp");
});
```

- [ ] **Step 2: Run tests to verify current helper behavior**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS. These tests pin the helper contract before the store starts using it.

- [ ] **Step 3: Use avatar helper in prompt store**

In `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/storage/prompt-store.js`, add near the existing `planLimits` constant:

```javascript
  const promptAvatar = namespace.promptAvatar;
```

Replace the returned object in `sanitizePrompt(input)` with:

```javascript
    const avatar = promptAvatar.normalizePromptAvatar(source);

    return {
      id: String(source.id || generateId()),
      name: String(source.name || "").trim() || "Untitled prompt",
      content: String(source.content || "").trim(),
      category: String(source.category || "").trim(),
      favorite: Boolean(source.favorite),
      createdAt: Number(source.createdAt) || now,
      updatedAt: Number(source.updatedAt) || now,
      ...avatar
    };
```

In `createPrompt(data)`, add this before constructing `prompt`:

```javascript
    const avatar = promptAvatar.normalizePromptAvatar(data);
```

Then add `...avatar` to the constructed prompt object after `updatedAt`.

In `savePrompt(prompt)`, normalize incoming prompt data before the `if (index >= 0)` block:

```javascript
    const normalizedPrompt = {
      ...prompt,
      ...promptAvatar.normalizePromptAvatar(prompt)
    };
```

Use `normalizedPrompt` instead of `prompt` anywhere the save path reads incoming `category`, spreads incoming values, or inserts a new object.

In `updatePrompt(id, updates)`, add this before the assignment:

```javascript
    const normalizedUpdates = {
      ...updates,
      ...promptAvatar.normalizePromptAvatar(updates)
    };
```

Spread `normalizedUpdates` into `prompts[index]` instead of `updates`.

- [ ] **Step 4: Keep quick-save prompts empty by default**

In `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/content/save-modal.js`, leave `store.createPrompt` with no avatar fields. Verify the quick-save payload remains:

```javascript
            await store.createPrompt({
              name: payload.name,
              content: payload.content,
              category: payload.category,
              favorite: false
            });
```

- [ ] **Step 5: Run tests**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS.

---

### Task 4: Add Supabase Prompt Avatar Schema And Storage Policies

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/supabase/mvp-prompts.sql`

- [ ] **Step 1: Add prompt avatar columns**

In `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/supabase/mvp-prompts.sql`, after the `updated_at` column in `create table if not exists public.prompts`, add:

```sql
  avatar_type text null,
  avatar_emoji text null,
  avatar_image_path text null,
  constraint prompts_avatar_type_check check (
    avatar_type is null
    or avatar_type in ('emoji', 'image')
  ),
  constraint prompts_avatar_emoji_check check (
    avatar_type <> 'emoji'
    or nullif(trim(coalesce(avatar_emoji, '')), '') is not null
  ),
  constraint prompts_avatar_image_path_check check (
    avatar_type <> 'image'
    or nullif(trim(coalesce(avatar_image_path, '')), '') is not null
  )
```

If the table already exists in production, also add idempotent migration statements after the table definition:

```sql
alter table public.prompts
add column if not exists avatar_type text null;

alter table public.prompts
add column if not exists avatar_emoji text null;

alter table public.prompts
add column if not exists avatar_image_path text null;
```

- [ ] **Step 2: Create avatar storage bucket and policies**

Add after RLS is enabled:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prompt-avatars',
  'prompt-avatars',
  false,
  262144,
  array['image/webp', 'image/jpeg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "prompt_avatar_objects_select_own" on storage.objects;
drop policy if exists "prompt_avatar_objects_insert_own" on storage.objects;
drop policy if exists "prompt_avatar_objects_update_own" on storage.objects;
drop policy if exists "prompt_avatar_objects_delete_own" on storage.objects;

create policy "prompt_avatar_objects_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'prompt-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "prompt_avatar_objects_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'prompt-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "prompt_avatar_objects_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'prompt-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'prompt-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "prompt_avatar_objects_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'prompt-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);
```

The storage object `name` will be `{user_id}/{prompt_id}/avatar.webp` or `{user_id}/{prompt_id}/avatar.jpg`. The prompt table stores that same object name in `avatar_image_path`.

- [ ] **Step 3: Run lint**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit landing schema changes**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git add supabase/mvp-prompts.sql
git commit -m "feat: add prompt avatar schema"
```

Expected: commit succeeds.

---

### Task 5: Add Background Sync And Storage Upload/Delete

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/background/service-worker.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/storage/prompt-store.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/prompt-avatar.test.js`

- [ ] **Step 1: Add failing payload mapping test**

Append to `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/prompt-avatar.test.js`:

```javascript
test("remote image payload clears emoji value", () => {
  assert.deepEqual(
    buildRemoteAvatarPayload({
      avatarType: "image",
      avatarEmoji: "🧠",
      avatarImagePath: "user-1/prompt-1/avatar.webp"
    }),
    {
      avatar_type: "image",
      avatar_emoji: null,
      avatar_image_path: "user-1/prompt-1/avatar.webp"
    }
  );
});
```

- [ ] **Step 2: Run tests to verify the contract**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS.

- [ ] **Step 3: Load avatar helper in service worker**

In `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/background/service-worker.js`, replace:

```javascript
importScripts("../utils/plan-limits.js");
```

with:

```javascript
importScripts("../utils/plan-limits.js", "../utils/prompt-avatar.js");
```

Add near `const planLimits`:

```javascript
const promptAvatar = globalThis.PromptOrganizer.promptAvatar;
const AVATAR_BUCKET = "prompt-avatars";
```

- [ ] **Step 4: Include avatar fields in Supabase prompt upsert**

In `syncPromptToSupabase(prompt, session)`, add avatar payload into `promptBody`:

```javascript
  const promptBody = {
    category_id: categoryId,
    content: String(prompt.content || "").trim(),
    title: String(prompt.name || "").trim() || "Untitled prompt",
    updated_at: toIsoString(prompt.updatedAt),
    ...promptAvatar.buildRemoteAvatarPayload(prompt)
  };
```

In `fetchRemotePrompts(session)`, change the select list to:

```javascript
    `/rest/v1/prompts?select=id,title,content,category_id,created_at,updated_at,avatar_type,avatar_emoji,avatar_image_path&user_id=eq.${encodeURIComponent(session.user.id)}&order=updated_at.desc`,
```

In `buildLocalPromptFromRemote(prompt, categoryName)`, include:

```javascript
    ...promptAvatar.buildLocalAvatarFromRemote(prompt)
```

- [ ] **Step 5: Add storage helpers**

Add these functions after `supabaseRequest`:

```javascript
async function supabaseStorageRequest(path, { session, method = "GET", body, contentType } = {}) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${session.access_token}`
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const response = await fetch(`${SUPABASE_URL}/storage/v1/${path}`, {
    method,
    headers,
    body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase storage request failed with status ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function uploadPromptAvatar({ promptId, blob, extension, mimeType }) {
  const session = await getValidAuthSession("avatar upload");

  if (!session?.access_token || !session?.user?.id) {
    return {
      ok: false,
      error: "No authenticated extension session available."
    };
  }

  const safeExtension = extension === "jpg" ? "jpg" : "webp";
  const objectName = `${session.user.id}/${promptId}/avatar.${safeExtension}`;

  try {
    await supabaseStorageRequest(
      `object/${AVATAR_BUCKET}/${encodeURIComponent(objectName).replaceAll("%2F", "/")}`,
      {
        session,
        method: "POST",
        body: blob,
        contentType: mimeType || (safeExtension === "jpg" ? "image/jpeg" : "image/webp")
      }
    );

    return {
      ok: true,
      avatarImagePath: objectName
    };
  } catch (error) {
    console.error("[Prompt Organizer] Avatar upload failed.", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Avatar upload failed."
    };
  }
}

async function deletePromptAvatar(avatarImagePath) {
  const session = await getValidAuthSession("avatar delete");

  if (!session?.access_token || !session?.user?.id || !avatarImagePath) {
    return {
      ok: false,
      skipped: true
    };
  }

  try {
    await supabaseStorageRequest(`object/${AVATAR_BUCKET}`, {
      session,
      method: "DELETE",
      body: JSON.stringify({ prefixes: [avatarImagePath] }),
      contentType: "application/json"
    });

    return { ok: true };
  } catch (error) {
    console.warn("[Prompt Organizer] Avatar cleanup failed.", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Avatar cleanup failed."
    };
  }
}
```

- [ ] **Step 6: Wire runtime messages**

In the `chrome.runtime.onMessage.addListener` message handler, add:

```javascript
  if (message.type === "prompttray:avatar:upload") {
    uploadPromptAvatar(message).then(sendResponse);
    return true;
  }

  if (message.type === "prompttray:avatar:delete") {
    deletePromptAvatar(message.avatarImagePath).then(sendResponse);
    return true;
  }
```

In `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/storage/prompt-store.js`, add:

```javascript
  async function uploadPromptAvatar(promptId, optimizedImage) {
    return notifyBackground({
      type: "prompttray:avatar:upload",
      promptId,
      blob: optimizedImage.blob,
      extension: optimizedImage.extension,
      mimeType: optimizedImage.mimeType
    });
  }

  async function deletePromptAvatar(avatarImagePath) {
    return notifyBackground({
      type: "prompttray:avatar:delete",
      avatarImagePath
    });
  }
```

Expose both methods in the `namespace.store` API object.

- [ ] **Step 7: Cleanup avatar file when deleting a prompt**

In `deletePrompt(id)`, after `await syncDeletedPromptToAccount(deletedPrompt);`, add:

```javascript
    if (deletedPrompt?.avatarType === "image" && deletedPrompt.avatarImagePath) {
      deletePromptAvatar(deletedPrompt.avatarImagePath).catch(() => {});
    }
```

- [ ] **Step 8: Run tests**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS.

---

### Task 6: Add Sidebar Avatar UI And Styles

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/content/sidebar.js`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/styles/content.css`
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/prompt-avatar.test.js`

- [ ] **Step 1: Add avatar rendering test**

Append to `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/test/prompt-avatar.test.js`:

```javascript
test("renders image avatar markup with runtime url when present", () => {
  assert.equal(
    renderPromptAvatarMarkup(
      {
        avatarType: "image",
        avatarImagePath: "user-1/prompt-1/avatar.webp",
        avatarImageUrl: "https://example.com/avatar.webp"
      },
      (value) => String(value).replaceAll("&", "&amp;")
    ),
    '<span class="po-prompt-avatar po-prompt-avatar--image" aria-hidden="true"><img src="https://example.com/avatar.webp" alt="" loading="lazy" /></span>'
  );
});
```

- [ ] **Step 2: Run tests**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS.

- [ ] **Step 3: Add sidebar dependencies and editor state fields**

In `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/content/sidebar.js`, add near other namespace constants:

```javascript
  const promptAvatar = namespace.promptAvatar;
  const imageOptimizer = namespace.imageOptimizer;
```

In `openEditor(draft = null)`, include avatar defaults:

```javascript
      const avatar = promptAvatar.normalizePromptAvatar(draft || {});
      this.editorState = draft
        ? {
            ...draft,
            category: this.getPromptCategory(draft),
            ...avatar
          }
        : {
            id: null,
            name: "",
            content: "",
            category: this.getDefaultCategoryForNewPrompt(),
            favorite: false,
            avatarType: null,
            avatarEmoji: null,
            avatarImagePath: null,
            avatarImageUrl: null
          };
```

Remove the existing direct draft-or-default `this.editorState` assignment when adding this block.

- [ ] **Step 4: Add editor input handling**

In `handlePanelInput(event)`, before the search input branch, add:

```javascript
      if (target.classList.contains("po-avatar-emoji-input")) {
        const avatarEmoji = String(target.value || "").trim();
        this.editorState = {
          ...this.editorState,
          avatarType: avatarEmoji ? "emoji" : null,
          avatarEmoji: avatarEmoji || null,
          avatarImagePath: null,
          avatarImageUrl: null
        };
        this.render();
        return;
      }

      if (target.classList.contains("po-avatar-image-input")) {
        this.handleAvatarImageInput(target);
        return;
      }
```

Add this method before `handleEditorSubmit`:

```javascript
    async handleAvatarImageInput(input) {
      const [file] = Array.from(input.files || []);
      input.value = "";

      if (!file) {
        return;
      }

      try {
        const optimized = await imageOptimizer.optimizeAvatarImage(file);
        this.editorState = {
          ...this.editorState,
          avatarType: "image",
          avatarEmoji: null,
          avatarImagePath: null,
          avatarImageUrl: optimized.objectUrl,
          pendingAvatarImage: optimized
        };
        this.render();
      } catch (error) {
        toast.show(error instanceof Error ? error.message : "Unable to use this image", "warning");
      }
    }
```

- [ ] **Step 5: Add avatar button actions**

In `handlePanelClick(event)`, add cases before `default`:

```javascript
        case "trigger-avatar-upload":
          this.panel.querySelector(".po-avatar-image-input")?.click();
          return;
        case "remove-avatar":
          if (this.editorState?.avatarImageUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(this.editorState.avatarImageUrl);
          }
          this.editorState = {
            ...this.editorState,
            avatarType: null,
            avatarEmoji: null,
            avatarImagePath: null,
            avatarImageUrl: null,
            pendingAvatarImage: null
          };
          this.render();
          return;
```

- [ ] **Step 6: Include avatar metadata in submit payload**

In `handleEditorSubmit(event)`, create avatar metadata before `payload`:

```javascript
      const avatar = promptAvatar.normalizePromptAvatar(this.editorState || {});
```

Add avatar fields to `payload`:

```javascript
        ...avatar
```

After saving the prompt, upload pending image if present:

```javascript
        const savedPrompt = this.editorState?.id
          ? await store.updatePrompt(this.editorState.id, payload)
          : await store.createPrompt(payload);

        if (this.editorState?.pendingAvatarImage && savedPrompt?.id) {
          const uploadResult = await store.uploadPromptAvatar?.(savedPrompt.id, this.editorState.pendingAvatarImage);
          if (uploadResult?.ok && uploadResult.avatarImagePath) {
            await store.updatePrompt(savedPrompt.id, {
              ...payload,
              avatarType: "image",
              avatarEmoji: null,
              avatarImagePath: uploadResult.avatarImagePath,
              avatarImageUrl: null
            });
          } else {
            toast.show(uploadResult?.error || "Prompt saved, but avatar upload failed", "warning");
          }
        }
```

When adding this, replace the current separate `store.updatePrompt` and `store.createPrompt` calls so each submit saves once, then optionally uploads.

- [ ] **Step 7: Render avatar controls and row avatar**

In `renderPromptRow(prompt)`, add before the category badge:

```javascript
            ${promptAvatar.renderPromptAvatarMarkup(prompt, escapeHtml)}
```

In `renderEditorView()`, add this label block between the Category field and Prompt Content field:

```javascript
              <div class="po-field po-avatar-field">
                <span class="po-field__label">Avatar</span>
                <div class="po-avatar-editor">
                  <div class="po-avatar-editor__preview">
                    ${promptAvatar.renderPromptAvatarMarkup(this.editorState, escapeHtml) || '<span class="po-avatar-editor__empty" aria-hidden="true"></span>'}
                  </div>
                  <div class="po-avatar-editor__controls">
                    <input class="po-sidebar-field po-avatar-emoji-input" type="text" maxlength="4" placeholder="Emoji" value="${escapeHtml(this.editorState.avatarType === "emoji" ? this.editorState.avatarEmoji || "" : "")}" />
                    <button class="po-sidebar-secondary-button" type="button" data-action="trigger-avatar-upload">Upload image</button>
                    <button class="po-sidebar-link" type="button" data-action="remove-avatar">Remove</button>
                    <input class="po-avatar-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden />
                  </div>
                </div>
              </div>
```

- [ ] **Step 8: Add CSS**

Append to `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension/src/styles/content.css` near existing prompt row styles:

```css
.po-prompt-avatar {
  align-items: center;
  background: rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  display: inline-flex;
  flex: 0 0 34px;
  height: 34px;
  justify-content: center;
  overflow: hidden;
  width: 34px;
}

.po-prompt-avatar--emoji {
  font-size: 18px;
  line-height: 1;
}

.po-prompt-avatar--image img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.po-avatar-editor {
  align-items: center;
  display: flex;
  gap: 12px;
}

.po-avatar-editor__preview {
  align-items: center;
  display: flex;
  flex: 0 0 44px;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.po-avatar-editor__preview .po-prompt-avatar,
.po-avatar-editor__empty {
  flex-basis: 44px;
  height: 44px;
  width: 44px;
}

.po-avatar-editor__empty {
  background: rgba(15, 23, 42, 0.06);
  border: 1px dashed rgba(15, 23, 42, 0.18);
  border-radius: 999px;
  display: block;
}

.po-avatar-editor__controls {
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(72px, 88px) 1fr auto;
  width: 100%;
}
```

In the existing `.po-prompt-row__main` rule, ensure it supports avatar alignment:

```css
  align-items: flex-start;
  gap: 10px;
```

- [ ] **Step 9: Run tests**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS.

---

### Task 7: Add Dashboard Read-Only Avatar Rendering

**Files:**
- Modify: `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/src/app/app/page.tsx`

- [ ] **Step 1: Update prompt query**

In the Supabase prompt select, replace:

```typescript
"id, title, content, created_at, category:categories!prompts_category_id_fkey(id, name)"
```

with:

```typescript
"id, title, content, created_at, avatar_type, avatar_emoji, avatar_image_path, category:categories!prompts_category_id_fkey(id, name)"
```

- [ ] **Step 2: Add read-only avatar renderer**

In `/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/src/app/app/page.tsx`, add this helper above `export default async function AppPage()`:

```typescript
function renderPromptAvatar(prompt: PromptRow) {
  if (prompt.avatar_type === "emoji" && prompt.avatar_emoji) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted text-base">
        {prompt.avatar_emoji}
      </span>
    );
  }

  if (prompt.avatar_type === "image" && prompt.avatar_image_path) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted text-[10px] text-muted-foreground">
        IMG
      </span>
    );
  }

  return null;
}
```

This first dashboard version does not fetch signed image URLs server-side; it shows that an image avatar exists without exposing private storage details. A follow-up can add signed URL generation if the dashboard needs image previews.

- [ ] **Step 3: Render avatars beside prompt snapshots**

Where recent prompts are mapped in the dashboard, wrap the existing title/content block with a flex row:

```tsx
<div className="flex items-start gap-3">
  {renderPromptAvatar(prompt)}
  <div className="min-w-0">
    <p className="truncate font-medium text-foreground">{prompt.title}</p>
    <p className="line-clamp-2 text-sm text-muted-foreground">{prompt.content}</p>
  </div>
</div>
```

Use the same pattern for the single `recentPrompt` card if it displays prompt title/content separately.

- [ ] **Step 4: Run lint**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit dashboard changes**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git add src/app/app/page.tsx
git commit -m "feat: show prompt avatars on dashboard"
```

Expected: commit succeeds.

---

### Task 8: Final Verification

**Files:**
- All changed files.

- [ ] **Step 1: Run extension tests**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension
npm test
```

Expected: PASS.

- [ ] **Step 2: Run landing lint**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Inspect landing git diff**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager/prompt-manager-landing
git status --short
git diff --stat
```

Expected: landing changes are committed or limited to reviewed dashboard/schema/plan files.

- [ ] **Step 4: Inspect extension changed files**

Run:

```bash
cd /Users/denispetrenko/Documents/PromptManager
git -C prompt-manager-landing status --short
find prompt-organizer-extension/src prompt-organizer-extension/test -type f -newer prompt-manager-landing/docs/superpowers/specs/2026-04-28-prompt-thumbnail-upload-design.md | sort
```

Expected: extension changes are limited to avatar helpers, prompt store, background sync, sidebar UI, content styles, manifests, and tests.

- [ ] **Step 5: Manual browser smoke test**

Load the unpacked extension from `/Users/denispetrenko/Documents/PromptManager/prompt-organizer-extension` in Chrome, log in with a test account, and verify:

- A prompt can be saved with no avatar.
- A prompt can be edited to use an emoji avatar.
- A prompt can be edited to use an uploaded image avatar.
- The image avatar renders as a circle in the prompt list.
- Reopening the extension after sync preserves the avatar.
- Removing the avatar returns the row to no-avatar state.

Expected: each flow works without console errors and without changing Free/Premium prompt/category limits.
