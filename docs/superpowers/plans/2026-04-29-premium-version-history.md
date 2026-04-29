# Premium Version History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Premium-only prompt version history with a 20-version per-prompt limit, locked downgrade state, and 90-day retention messaging.

**Architecture:** Supabase stores authoritative prompt versions and exposes RPCs for snapshot and restore. The Chrome extension keeps editing local-first, then the background sync path snapshots the remote prompt before remote content updates. The sidebar adds a History entry point that is enabled for active Premium users and locked for Free/inactive Premium users.

**Tech Stack:** Supabase SQL/RLS/RPC, Chrome extension Manifest V3 service worker, vanilla JavaScript modules under `PromptOrganizer`, Node `node:test`, existing PromptTray sidebar CSS.

---

## File Structure

- Create `prompt-manager-landing/supabase/premium-version-history.sql`
  - Owns the `prompt_versions` table, RLS policies, snapshot RPC, restore RPC, and 90-day cleanup function.
- Create `prompt-organizer-extension/src/utils/version-history.js`
  - Owns plan-state helpers, locked copy, version normalization, and formatting.
- Create `prompt-organizer-extension/test/version-history.test.js`
  - Tests the pure helper behavior without requiring Chrome APIs.
- Modify `prompt-organizer-extension/src/background/service-worker.js`
  - Adds REST/RPC calls for version listing and restore.
  - Calls snapshot RPC before patching an existing remote prompt.
  - Adds runtime message handlers for history list and restore.
- Modify `prompt-organizer-extension/src/storage/prompt-store.js`
  - Adds small methods that content scripts can call: `getPromptVersions(prompt)`, `restorePromptVersion(prompt, versionId)`.
- Modify `prompt-organizer-extension/src/content/sidebar.js`
  - Adds History UI state, actions, locked view, list view, restore confirmation, and local prompt refresh after restore.
- Modify `prompt-organizer-extension/src/styles/content.css`
  - Adds compact editor History button, history panel, version row, locked state, and restore-confirm styles.
- Modify `prompt-organizer-extension/manifest.json`, `manifest.dev.json`, `manifest.prod.json`
  - Loads `src/utils/version-history.js` before `src/storage/prompt-store.js` and `src/content/sidebar.js`.

Current git note: this workspace only has a Git repo at `prompt-manager-landing/.git`. Extension files are outside that repo in the current checkout, so extension tasks cannot be committed locally unless the workspace is reorganized or another repo is initialized.

---

### Task 1: Supabase Schema And RPCs

**Files:**
- Create: `prompt-manager-landing/supabase/premium-version-history.sql`
- Reference: `prompt-manager-landing/supabase/mvp-prompts.sql`

- [ ] **Step 1: Create the migration SQL**

Create `prompt-manager-landing/supabase/premium-version-history.sql` with:

```sql
create extension if not exists pgcrypto;

create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  created_from text not null default 'edit',
  constraint prompt_versions_created_from_check check (created_from in ('edit', 'restore')),
  constraint prompt_versions_content_check check (nullif(trim(content), '') is not null)
);

alter table public.prompt_versions enable row level security;

create index if not exists prompt_versions_user_prompt_created_idx
on public.prompt_versions(user_id, prompt_id, created_at desc);

create index if not exists prompt_versions_user_created_idx
on public.prompt_versions(user_id, created_at);

drop policy if exists "prompt_versions_select_active_premium_own" on public.prompt_versions;

create policy "prompt_versions_select_active_premium_own"
on public.prompt_versions
for select
to authenticated
using (
  auth.uid() = user_id
  and public.is_premium_user(auth.uid())
);

create or replace function public.prune_prompt_versions(check_prompt_id uuid, check_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.prompt_versions
  where id in (
    select id
    from (
      select
        id,
        row_number() over (partition by prompt_id order by created_at desc, id desc) as version_rank
      from public.prompt_versions
      where prompt_id = check_prompt_id
        and user_id = check_user_id
    ) ranked_versions
    where version_rank > 20
  );
$$;

create or replace function public.create_prompt_version(
  check_prompt_id uuid,
  version_title text,
  version_content text,
  version_source text default 'edit'
)
returns public.prompt_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  owned_prompt public.prompts%rowtype;
  inserted_version public.prompt_versions%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  if not public.is_premium_user(current_user_id) then
    raise exception 'Version history is locked'
      using errcode = 'P0001';
  end if;

  if version_source not in ('edit', 'restore') then
    raise exception 'Invalid version source'
      using errcode = 'P0001';
  end if;

  if nullif(trim(coalesce(version_content, '')), '') is null then
    raise exception 'Version content cannot be empty'
      using errcode = 'P0001';
  end if;

  select *
  into owned_prompt
  from public.prompts
  where id = check_prompt_id
    and user_id = current_user_id;

  if not found then
    raise exception 'Prompt not found'
      using errcode = 'P0001';
  end if;

  insert into public.prompt_versions (
    prompt_id,
    user_id,
    title,
    content,
    created_from
  )
  values (
    owned_prompt.id,
    current_user_id,
    coalesce(nullif(trim(version_title), ''), owned_prompt.title, 'Untitled prompt'),
    trim(version_content),
    version_source
  )
  returning * into inserted_version;

  perform public.prune_prompt_versions(owned_prompt.id, current_user_id);

  return inserted_version;
end;
$$;

create or replace function public.restore_prompt_version(check_version_id uuid)
returns public.prompts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  selected_version public.prompt_versions%rowtype;
  current_prompt public.prompts%rowtype;
  restored_prompt public.prompts%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  if not public.is_premium_user(current_user_id) then
    raise exception 'Version history is locked'
      using errcode = 'P0001';
  end if;

  select *
  into selected_version
  from public.prompt_versions
  where id = check_version_id
    and user_id = current_user_id;

  if not found then
    raise exception 'Version not found'
      using errcode = 'P0001';
  end if;

  select *
  into current_prompt
  from public.prompts
  where id = selected_version.prompt_id
    and user_id = current_user_id;

  if not found then
    raise exception 'Prompt not found'
      using errcode = 'P0001';
  end if;

  if current_prompt.content is distinct from selected_version.content then
    perform public.create_prompt_version(
      current_prompt.id,
      current_prompt.title,
      current_prompt.content,
      'restore'
    );
  end if;

  update public.prompts
  set
    title = selected_version.title,
    content = selected_version.content,
    updated_at = now()
  where id = current_prompt.id
    and user_id = current_user_id
  returning * into restored_prompt;

  perform public.prune_prompt_versions(current_prompt.id, current_user_id);

  return restored_prompt;
end;
$$;

create or replace function public.delete_inactive_prompt_versions_older_than_90_days()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.prompt_versions pv
  where pv.created_at < now() - interval '90 days'
    and not public.is_premium_user(pv.user_id);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
```

- [ ] **Step 2: Review SQL syntax locally**

Run:

```bash
rg -n "version_source not in|row_number|delete_inactive" prompt-manager-landing/supabase/premium-version-history.sql
```

Expected: all three terms should appear in the migration.

- [ ] **Step 3: Commit the landing migration**

Run:

```bash
git -C prompt-manager-landing add supabase/premium-version-history.sql
git -C prompt-manager-landing commit -m "feat: add premium version history schema"
```

Expected: commit succeeds. If the file was already committed by another worker, skip this commit and note the existing commit hash.

---

### Task 2: Version History Helper And Tests

**Files:**
- Create: `prompt-organizer-extension/src/utils/version-history.js`
- Create: `prompt-organizer-extension/test/version-history.test.js`

- [ ] **Step 1: Write the failing helper tests**

Create `prompt-organizer-extension/test/version-history.test.js`:

```js
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  HISTORY_LOCKED_MESSAGE,
  getHistoryAccess,
  normalizeVersion,
  shouldSnapshotPromptContent,
  truncateVersionPreview
} = require("../src/utils/version-history.js");

test("premium active users can use version history", () => {
  assert.deepEqual(
    getHistoryAccess({ plan: "premium", entitlementStatus: "active" }),
    {
      canUseHistory: true,
      cta: "",
      message: "",
      state: "enabled"
    }
  );
});

test("free users see locked upgrade state", () => {
  const access = getHistoryAccess({ plan: "free", entitlementStatus: "inactive" });

  assert.equal(access.canUseHistory, false);
  assert.equal(access.state, "locked");
  assert.equal(access.message, HISTORY_LOCKED_MESSAGE);
  assert.equal(access.cta, "Upgrade to Premium");
});

test("inactive premium users see reactivation state", () => {
  const access = getHistoryAccess({ plan: "premium", entitlementStatus: "canceled" });

  assert.equal(access.canUseHistory, false);
  assert.equal(access.state, "locked");
  assert.equal(access.message, HISTORY_LOCKED_MESSAGE);
  assert.equal(access.cta, "Reactivate Premium");
});

test("snapshots only when existing prompt content changes", () => {
  assert.equal(
    shouldSnapshotPromptContent(
      { remoteId: "remote-1", content: "Old prompt" },
      { content: "New prompt" }
    ),
    true
  );
  assert.equal(
    shouldSnapshotPromptContent(
      { remoteId: "remote-1", content: "Same prompt" },
      { content: "Same prompt", name: "Renamed" }
    ),
    false
  );
  assert.equal(
    shouldSnapshotPromptContent(
      { content: "Old local prompt" },
      { content: "New local prompt" }
    ),
    false
  );
});

test("normalizes remote versions for sidebar rendering", () => {
  const version = normalizeVersion({
    id: "version-1",
    title: "  My prompt  ",
    content: "  Prompt content  ",
    created_at: "2026-04-29T12:00:00.000Z",
    created_from: "restore"
  });

  assert.equal(version.id, "version-1");
  assert.equal(version.title, "My prompt");
  assert.equal(version.content, "Prompt content");
  assert.equal(version.createdAt, "2026-04-29T12:00:00.000Z");
  assert.equal(version.createdFrom, "restore");
});

test("truncates long version previews", () => {
  assert.equal(truncateVersionPreview("Short", 20), "Short");
  assert.equal(truncateVersionPreview("A".repeat(45), 20), `${"A".repeat(20)}...`);
});
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run:

```bash
cd prompt-organizer-extension
npm test -- version-history.test.js
```

Expected: FAIL because `src/utils/version-history.js` does not exist yet.

- [ ] **Step 3: Implement the helper**

Create `prompt-organizer-extension/src/utils/version-history.js`:

```js
(function initVersionHistory(global) {
  const namespace = global.PromptOrganizer || (global.PromptOrganizer = {});

  const HISTORY_LOCKED_MESSAGE =
    "Version history is locked. We'll keep your previous versions for 90 days, so you can restore them if you reactivate Premium.";

  function normalizeStatus(value) {
    return String(value || "inactive").trim().toLowerCase() || "inactive";
  }

  function isActivePremium(settings = {}) {
    return String(settings.plan || "").trim().toLowerCase() === "premium" &&
      normalizeStatus(settings.entitlementStatus || settings.status) === "active";
  }

  function getHistoryAccess(settings = {}) {
    if (isActivePremium(settings)) {
      return {
        canUseHistory: true,
        cta: "",
        message: "",
        state: "enabled"
      };
    }

    const requestedPlan = String(settings.plan || "").trim().toLowerCase();
    return {
      canUseHistory: false,
      cta: requestedPlan === "premium" ? "Reactivate Premium" : "Upgrade to Premium",
      message: HISTORY_LOCKED_MESSAGE,
      state: "locked"
    };
  }

  function shouldSnapshotPromptContent(previousPrompt, nextPrompt) {
    if (!previousPrompt?.remoteId) {
      return false;
    }

    const previousContent = String(previousPrompt.content || "").trim();
    const nextContent = String(nextPrompt?.content || "").trim();
    return Boolean(previousContent && nextContent && previousContent !== nextContent);
  }

  function normalizeVersion(version) {
    const source = version && typeof version === "object" ? version : {};
    return {
      content: String(source.content || "").trim(),
      createdAt: source.created_at || source.createdAt || "",
      createdFrom: String(source.created_from || source.createdFrom || "edit").trim() || "edit",
      id: String(source.id || ""),
      title: String(source.title || "").trim() || "Untitled prompt"
    };
  }

  function normalizeVersions(versions) {
    return (Array.isArray(versions) ? versions : [])
      .map(normalizeVersion)
      .filter((version) => version.id && version.content);
  }

  function truncateVersionPreview(content, maxLength = 120) {
    const normalized = String(content || "").trim().replace(/\s+/g, " ");
    if (normalized.length <= maxLength) {
      return normalized;
    }

    return `${normalized.slice(0, maxLength)}...`;
  }

  const api = {
    HISTORY_LOCKED_MESSAGE,
    getHistoryAccess,
    isActivePremium,
    normalizeVersion,
    normalizeVersions,
    shouldSnapshotPromptContent,
    truncateVersionPreview
  };

  namespace.versionHistory = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
```

- [ ] **Step 4: Run helper tests to verify they pass**

Run:

```bash
cd prompt-organizer-extension
npm test -- version-history.test.js
```

Expected: PASS for all tests in `version-history.test.js`.

---

### Task 3: Background Sync And RPC Methods

**Files:**
- Modify: `prompt-organizer-extension/src/background/service-worker.js`

- [ ] **Step 1: Add version helper loading**

In each of these files, add `src/utils/version-history.js` immediately after `src/utils/plan-limits.js` in the content script `js` array:

```text
prompt-organizer-extension/manifest.json
prompt-organizer-extension/manifest.dev.json
prompt-organizer-extension/manifest.prod.json
```

The manifest snippet should become:

```json
"js": [
  "src/utils/constants.js",
  "src/utils/plan-limits.js",
  "src/utils/version-history.js",
  "src/utils/prompt-variables.js",
  "src/utils/prompt-avatar.js"
]
```

- [ ] **Step 2: Add background helper functions**

In `prompt-organizer-extension/src/background/service-worker.js`, after `ensureRemoteCategory`, add:

```js
async function fetchRemotePrompt(prompt, session) {
  if (!prompt?.remoteId) {
    return null;
  }

  const rows = await supabaseRequest(
    `/rest/v1/prompts?select=id,title,content,user_id&user_id=eq.${encodeURIComponent(session.user.id)}&id=eq.${encodeURIComponent(prompt.remoteId)}&limit=1`,
    {
      session,
      returnRepresentation: false
    }
  );

  return Array.isArray(rows) ? rows[0] || null : null;
}

async function createRemotePromptVersion({ promptId, title, content, source = "edit" }, session) {
  return supabaseRequest("/rest/v1/rpc/create_prompt_version", {
    session,
    method: "POST",
    body: {
      check_prompt_id: promptId,
      version_title: title,
      version_content: content,
      version_source: source
    }
  });
}

function isLockedHistoryError(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /Version history is locked|not active premium|premium/i.test(message);
}

async function snapshotRemotePromptBeforeUpdate(prompt, promptBody, session) {
  if (!prompt?.remoteId) {
    return;
  }

  const remotePrompt = await fetchRemotePrompt(prompt, session);
  if (!remotePrompt?.content) {
    return;
  }

  const previousContent = String(remotePrompt.content || "").trim();
  const nextContent = String(promptBody.content || "").trim();
  if (!previousContent || !nextContent || previousContent === nextContent) {
    return;
  }

  try {
    await createRemotePromptVersion({
      content: previousContent,
      promptId: remotePrompt.id,
      source: "edit",
      title: remotePrompt.title || promptBody.title || "Untitled prompt"
    }, session);
  } catch (error) {
    if (isLockedHistoryError(error)) {
      syncDebugLog("info", "[PromptTray] Version history locked; continuing prompt update.");
      return;
    }

    console.warn("[Prompt Organizer] Failed to snapshot prompt version before update.", error);
  }
}

async function fetchPromptVersions(prompt, session) {
  if (!prompt?.remoteId) {
    return [];
  }

  const rows = await supabaseRequest(
    `/rest/v1/prompt_versions?select=id,title,content,created_at,created_from&prompt_id=eq.${encodeURIComponent(prompt.remoteId)}&user_id=eq.${encodeURIComponent(session.user.id)}&order=created_at.desc&limit=20`,
    {
      session,
      returnRepresentation: false
    }
  );

  return Array.isArray(rows) ? rows : [];
}

async function restorePromptVersion(versionId, session) {
  return supabaseRequest("/rest/v1/rpc/restore_prompt_version", {
    session,
    method: "POST",
    body: {
      check_version_id: versionId
    }
  });
}
```

- [ ] **Step 3: Call snapshot before patching existing prompts**

In `syncPromptToSupabase`, inside the `if (prompt.remoteId)` branch, insert this before the `PATCH` call:

```js
    await snapshotRemotePromptBeforeUpdate(prompt, promptBody, session);
```

The branch should become:

```js
  if (prompt.remoteId) {
    await snapshotRemotePromptBeforeUpdate(prompt, promptBody, session);

    await supabaseRequest(
      `/rest/v1/prompts?id=eq.${encodeURIComponent(prompt.remoteId)}&user_id=eq.${encodeURIComponent(session.user.id)}`,
      {
        session,
        method: "PATCH",
        body: promptBody
      }
    );

    return prompt.remoteId;
  }
```

- [ ] **Step 4: Add message handlers**

Before the existing `prompttray:sync:prompt-upsert` handler, add:

```js
  if (message.type === "prompttray:history:list") {
    getValidAuthSession("version history list")
      .then((session) => fetchPromptVersions(message.prompt, session))
      .then((versions) => sendResponse({ ok: true, versions }))
      .catch((error) => {
        console.error("[Prompt Organizer] Failed to fetch prompt versions.", error);
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "Unable to load version history."
        });
      });
    return true;
  }

  if (message.type === "prompttray:history:restore") {
    getValidAuthSession("version history restore")
      .then((session) => restorePromptVersion(message.versionId, session))
      .then((prompt) => sendResponse({ ok: true, prompt }))
      .catch((error) => {
        console.error("[Prompt Organizer] Failed to restore prompt version.", error);
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "Unable to restore version."
        });
      });
    return true;
  }
```

- [ ] **Step 5: Run extension tests**

Run:

```bash
cd prompt-organizer-extension
npm test
```

Expected: existing tests plus `version-history.test.js` pass.

---

### Task 4: Prompt Store History API

**Files:**
- Modify: `prompt-organizer-extension/src/storage/prompt-store.js`

- [ ] **Step 1: Add history methods near other background wrappers**

After `deletePromptAvatar`, add:

```js
  async function getPromptVersions(prompt) {
    const response = await notifyBackground({
      type: "prompttray:history:list",
      prompt
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Unable to load version history.");
    }

    return namespace.versionHistory?.normalizeVersions
      ? namespace.versionHistory.normalizeVersions(response.versions)
      : (Array.isArray(response.versions) ? response.versions : []);
  }

  async function restorePromptVersion(prompt, versionId) {
    const response = await notifyBackground({
      type: "prompttray:history:restore",
      prompt,
      versionId
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Unable to restore version.");
    }

    return response.prompt || null;
  }
```

- [ ] **Step 2: Export the methods**

At the bottom export object, add:

```js
    getPromptVersions,
    restorePromptVersion,
```

Keep the existing alphabetical or local grouping style if nearby methods are grouped.

- [ ] **Step 3: Run extension tests**

Run:

```bash
cd prompt-organizer-extension
npm test
```

Expected: PASS.

---

### Task 5: Sidebar History UI

**Files:**
- Modify: `prompt-organizer-extension/src/content/sidebar.js`
- Modify: `prompt-organizer-extension/src/styles/content.css`

- [ ] **Step 1: Initialize editor history state**

In `openEditor`, add these fields to both the draft and new-prompt editor states:

```js
            historyOpen: false,
            historyLoading: false,
            historyError: "",
            historyVersions: [],
            restoreConfirmVersionId: ""
```

For the new-prompt state, use the same fields with the same initial values.

- [ ] **Step 2: Add sidebar methods**

Add these methods before `handleEditorSubmit`:

```js
    getHistoryAccess() {
      return namespace.versionHistory?.getHistoryAccess
        ? namespace.versionHistory.getHistoryAccess(this.settings || {})
        : { canUseHistory: false, cta: "Upgrade to Premium", message: "", state: "locked" };
    }

    async openHistoryPanel() {
      if (!this.editorState?.id) {
        return;
      }

      const access = this.getHistoryAccess();
      this.editorState = {
        ...this.editorState,
        historyOpen: true,
        historyError: "",
        historyLoading: access.canUseHistory,
        restoreConfirmVersionId: ""
      };
      this.render();

      if (!access.canUseHistory) {
        return;
      }

      try {
        const prompt = this.getPromptById(this.editorState.id);
        const versions = await store.getPromptVersions?.(prompt);
        this.editorState = {
          ...this.editorState,
          historyLoading: false,
          historyVersions: versions || []
        };
      } catch (error) {
        this.editorState = {
          ...this.editorState,
          historyError: error instanceof Error ? error.message : "Unable to load version history.",
          historyLoading: false
        };
      }

      this.render();
    }

    closeHistoryPanel() {
      if (!this.editorState) {
        return;
      }

      this.editorState = {
        ...this.editorState,
        historyOpen: false,
        historyError: "",
        historyLoading: false,
        restoreConfirmVersionId: ""
      };
      this.render();
    }

    confirmRestoreVersion(versionId) {
      if (!this.editorState) {
        return;
      }

      this.editorState = {
        ...this.editorState,
        restoreConfirmVersionId: versionId
      };
      this.render();
    }

    cancelRestoreVersion() {
      if (!this.editorState) {
        return;
      }

      this.editorState = {
        ...this.editorState,
        restoreConfirmVersionId: ""
      };
      this.render();
    }

    async restoreVersion(versionId) {
      const prompt = this.editorState?.id ? this.getPromptById(this.editorState.id) : null;
      if (!prompt || !versionId) {
        return;
      }

      try {
        const restoredPrompt = await store.restorePromptVersion?.(prompt, versionId);
        if (restoredPrompt?.content) {
          await store.updatePrompt(prompt.id, {
            content: restoredPrompt.content,
            name: restoredPrompt.title || restoredPrompt.name || prompt.name,
            category: prompt.category,
            favorite: prompt.favorite,
            ...namespace.promptAvatar.normalizePromptAvatar(prompt)
          });
        }

        const latestPrompt = this.getPromptById(prompt.id) || {
          ...prompt,
          content: restoredPrompt?.content || prompt.content,
          name: restoredPrompt?.title || prompt.name
        };
        this.openEditor(latestPrompt);
        toast.show("Version restored");
      } catch (error) {
        toast.show(error instanceof Error ? error.message : "Unable to restore version", "warning");
      }
    }
```

- [ ] **Step 3: Add click actions**

In the main click `switch (action)`, add:

```js
        case "open-history":
          await this.openHistoryPanel();
          return;
        case "close-history":
          this.closeHistoryPanel();
          return;
        case "confirm-restore-version":
          this.confirmRestoreVersion(button.dataset.versionId || "");
          return;
        case "cancel-restore-version":
          this.cancelRestoreVersion();
          return;
        case "restore-version":
          await this.restoreVersion(button.dataset.versionId || "");
          return;
```

- [ ] **Step 4: Render history panel helper**

Add this method before `renderEditorView`:

```js
    renderHistoryPanel() {
      if (!this.editorState?.historyOpen) {
        return "";
      }

      const access = this.getHistoryAccess();
      if (!access.canUseHistory) {
        return `
          <section class="po-history-panel po-history-panel--locked">
            <div class="po-history-panel__header">
              <h3>Version History</h3>
              <button class="po-sidebar-link" type="button" data-action="close-history">Close</button>
            </div>
            <div class="po-history-locked">
              <div class="po-history-locked__icon">${ICONS.lock}</div>
              <p>${escapeHtml(access.message)}</p>
              <button class="po-sidebar-primary-button" type="button" data-action="upgrade">${escapeHtml(access.cta)}</button>
            </div>
          </section>
        `;
      }

      if (this.editorState.historyLoading) {
        return `
          <section class="po-history-panel">
            <div class="po-history-panel__header">
              <h3>Version History</h3>
              <button class="po-sidebar-link" type="button" data-action="close-history">Close</button>
            </div>
            <p class="po-history-panel__empty">Loading previous versions...</p>
          </section>
        `;
      }

      if (this.editorState.historyError) {
        return `
          <section class="po-history-panel">
            <div class="po-history-panel__header">
              <h3>Version History</h3>
              <button class="po-sidebar-link" type="button" data-action="close-history">Close</button>
            </div>
            <p class="po-history-panel__empty">${escapeHtml(this.editorState.historyError)}</p>
          </section>
        `;
      }

      const versions = Array.isArray(this.editorState.historyVersions) ? this.editorState.historyVersions : [];
      const preview = namespace.versionHistory?.truncateVersionPreview || ((value) => String(value || ""));

      return `
        <section class="po-history-panel">
          <div class="po-history-panel__header">
            <h3>Version History</h3>
            <button class="po-sidebar-link" type="button" data-action="close-history">Close</button>
          </div>
          ${
            versions.length
              ? versions.map((version) => {
                  const isConfirming = this.editorState.restoreConfirmVersionId === version.id;
                  const dateLabel = version.createdAt
                    ? new Date(version.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                    : "Previous version";
                  return `
                    <article class="po-history-version">
                      <div class="po-history-version__content">
                        <p class="po-history-version__title">${escapeHtml(version.title)}</p>
                        <p class="po-history-version__meta">${escapeHtml(dateLabel)}</p>
                        <p class="po-history-version__preview">${escapeHtml(preview(version.content, 140))}</p>
                      </div>
                      ${
                        isConfirming
                          ? `
                            <div class="po-history-version__confirm">
                              <p>Restore this version? Your current prompt will be saved as a new version first.</p>
                              <button class="po-sidebar-primary-button" type="button" data-action="restore-version" data-version-id="${escapeHtml(version.id)}">Restore</button>
                              <button class="po-sidebar-secondary-button" type="button" data-action="cancel-restore-version">Cancel</button>
                            </div>
                          `
                          : `<button class="po-sidebar-secondary-button" type="button" data-action="confirm-restore-version" data-version-id="${escapeHtml(version.id)}">Restore</button>`
                      }
                    </article>
                  `;
                }).join("")
              : `<p class="po-history-panel__empty">No previous versions yet.</p>`
          }
        </section>
      `;
    }
```

- [ ] **Step 5: Add History button to editor view**

In `renderEditorView`, after the subtitle block and before the form body, add:

```js
              ${
                isEditing
                  ? `<button class="po-editor-history-button" type="button" data-action="open-history">
                      <span>${ICONS.clock || ICONS.back}</span>
                      Version History
                    </button>`
                  : ""
              }
```

Then render the panel inside the form before the footer:

```js
              ${this.renderHistoryPanel()}
```

- [ ] **Step 6: Add CSS**

Append near the editor CSS in `prompt-organizer-extension/src/styles/content.css`:

```css
.po-editor-history-button {
  align-items: center;
  align-self: flex-start;
  background: #f5f5f7;
  border: 1px solid #e8e8ed;
  border-radius: 10px;
  color: #1d1d1f;
  cursor: pointer;
  display: inline-flex;
  font-size: 13px;
  font-weight: 500;
  gap: 8px;
  height: 36px;
  justify-content: center;
  margin-top: 12px;
  padding: 0 12px;
}

.po-history-panel {
  border: 1px solid #e8e8ed;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

.po-history-panel__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.po-history-panel__header h3 {
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.po-history-panel__empty {
  color: #6e6e73;
  font-size: 13px;
  line-height: 18px;
  margin: 0;
}

.po-history-locked {
  align-items: flex-start;
  background: #f5f5f7;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

.po-history-locked p {
  color: #515154;
  font-size: 13px;
  line-height: 18px;
  margin: 0;
}

.po-history-locked__icon {
  align-items: center;
  background: #ffffff;
  border: 1px solid #e8e8ed;
  border-radius: 999px;
  color: #1d1d1f;
  display: inline-flex;
  height: 32px;
  justify-content: center;
  width: 32px;
}

.po-history-version {
  border-top: 1px solid #f2f2f2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 10px;
}

.po-history-version__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.po-history-version__title {
  color: #1d1d1f;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  margin: 0;
}

.po-history-version__meta,
.po-history-version__preview,
.po-history-version__confirm p {
  color: #6e6e73;
  font-size: 12px;
  line-height: 17px;
  margin: 0;
}

.po-history-version__confirm {
  background: #f5f5f7;
  border-radius: 12px;
  display: grid;
  gap: 8px;
  padding: 10px;
}
```

- [ ] **Step 7: Run extension tests**

Run:

```bash
cd prompt-organizer-extension
npm test
```

Expected: PASS.

---

### Task 6: Manual Verification And Release Notes

**Files:**
- Reference: `prompt-manager-landing/docs/superpowers/specs/2026-04-29-premium-version-history-design.md`
- Reference: `prompt-manager-landing/supabase/premium-version-history.sql`

- [ ] **Step 1: Verify SQL manually in Supabase**

Run the SQL from:

```text
prompt-manager-landing/supabase/premium-version-history.sql
```

Expected:

- `public.prompt_versions` exists.
- RLS is enabled.
- `public.create_prompt_version(...)` exists.
- `public.restore_prompt_version(...)` exists.
- `public.delete_inactive_prompt_versions_older_than_90_days()` exists.

- [ ] **Step 2: Verify extension behavior as Free user**

Manual steps:

1. Log into the extension as a Free user.
2. Open an existing prompt editor.
3. Click `Version History`.
4. Confirm locked message appears:

```text
Version history is locked. We'll keep your previous versions for 90 days, so you can restore them if you reactivate Premium.
```

Expected: no versions are displayed; CTA opens upgrade flow.

- [ ] **Step 3: Verify extension behavior as active Premium user**

Manual steps:

1. Mark the test account active Premium in `public.user_entitlements`.
2. Open an existing synced prompt.
3. Edit only the prompt title.
4. Confirm no new version is created.
5. Edit prompt content.
6. Confirm one version is created with the previous content.
7. Create more than 20 content edits.
8. Confirm only 20 versions remain for that prompt.

Expected: content edits create versions; title-only edits do not; pruning works.

- [ ] **Step 4: Verify restore**

Manual steps:

1. Open `Version History`.
2. Click `Restore` on a previous version.
3. Confirm the restore prompt.
4. Confirm the editor content updates.
5. Confirm the pre-restore content was saved as a new version.

Expected: restore is reversible.

- [ ] **Step 5: Verify inactive Premium lock**

Manual steps:

1. Change the test account entitlement status to `canceled`.
2. Open an existing prompt editor.
3. Click `Version History`.

Expected: history is locked immediately and shows the 90-day retention message.

- [ ] **Step 6: Run final automated tests**

Run:

```bash
cd prompt-organizer-extension
npm test
```

Expected: all extension tests pass.

- [ ] **Step 7: Record git state**

Run:

```bash
git -C prompt-manager-landing status --short
```

Expected: clean for landing repo after committed SQL/plan changes. Extension changes will not appear in this git status because the current extension folder is not inside a Git repo.
