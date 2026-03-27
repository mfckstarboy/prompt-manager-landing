# PromptTray Web

PromptTray is a Next.js + Supabase website for authentication, dashboard access, and Chrome extension handoff.

## Local development

```bash
npm install
npm run dev
```

Create a local `.env.local` with:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CHROME_EXTENSION_ID=
NEXT_PUBLIC_CHROME_EXTENSION_ID_DEV=
```

## MVP production checklist

- Set `NEXT_PUBLIC_SITE_URL` to your production domain in Vercel.
- Set `NEXT_PUBLIC_CHROME_EXTENSION_ID` to the production Chrome extension ID.
- Optionally set `NEXT_PUBLIC_CHROME_EXTENSION_ID_DEV` for local development.
- Run the SQL in [supabase/mvp-prompts.sql](/Users/denispetrenko/Documents/PromptManager/prompt-manager-landing/supabase/mvp-prompts.sql) in the production Supabase project.
- Confirm `public.prompts` and `public.categories` both have RLS enabled in Supabase.
- Confirm all four CRUD policies from the SQL file are active for both tables.
- Enable Supabase email confirmation for production signups.
- Add your production reset-password URL to Supabase Auth redirect URLs:
  `https://your-domain/reset-password`

## Notes

- The website dashboard also scopes reads by `user_id`, but production safety still depends on RLS being enabled in Supabase.
- The extension handoff now only trusts allowlisted extension IDs from environment variables.
