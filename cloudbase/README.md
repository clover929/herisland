# CloudBase deployment

Target: `herisland-staging-d8dnse0ea80165`, Shanghai; Cloud Run service `herisland`.

The existing Vercel and Workers deployments keep Demo mode. CloudBase uses the full Next.js application with SSR/API routes and real PostgreSQL data. All island art, motion, women records and pegboard assets remain in the source package. Hosted Sunny is explicitly unavailable; local Ollama configuration is unchanged.

## Runtime configuration

Set `NEXT_PUBLIC_DATA_MODE=cloudbase`, the three public CloudBase configuration values from `.env.example`, and exact HTTPS `APP_ORIGIN`. Public client configuration is fetched at runtime from `/api/cloudbase/config`; no server key is needed. Do not upload `.env.local`, database passwords, Tencent SecretKey, or a service-role key.

The Dockerfile builds standalone Next.js, copies `public` and `_next/static`, listens on `0.0.0.0:3000`, and runs as an unprivileged user. Deployment preparation copies only a reviewed source/static allowlist. `.dockerignore` excludes credentials and local artifacts.

## Database and identity

Eight staging migrations are recorded with checksums in `app_private.migration_history`. The first five are adapted from the preserved Supabase source. Actual staging `auth.users.id` is bigint, `sub` is text and `auth.uid()` returns text. Business profiles therefore use the verified JWT subject and do not modify vendor-owned authentication tables.

Business requests forward the user's access token, not an administrator token. Both the identity service and PostgreSQL RLS validate requests. Posts remain private drafts until a separately appointed moderator approves them. Bookmarks, memberships and walls are private to their owner. Wall updates use transactional validation, five-slot limits and an expected revision; stale writes fail instead of overwriting a newer layout. Shared database triggers limit repeated posts/comments/reports.

Public registration is blocked in both the UI and database during acceptance. Existing invited profiles remain usable. No public signup switch should be enabled until the actual operator, permitted community business/filing, privacy contact and retention policy, mail delivery/recovery, and operator moderation/deletion procedures have been accepted.

Account deletion currently hides public content and disables business writes immediately, then records an operator request. It does **not** claim to have deleted the authentication-provider identity or all retained records. Media uploads and cloud AI are not part of this release.

## Commands

Run the official CLI login before remote operations:

```sh
npm exec --yes --package=@cloudbase/cli -- tcb login
```

Generate/adapt migrations locally, test, and apply only to the named staging environment:

```sh
node scripts/prepare-cloudbase-migrations.mjs
npx vitest run tests/cloudbase-database.test.ts
node scripts/cloudbase-migrate.mjs --apply
```

Deploy and inspect the actual cloud build/runtime logs:

```sh
node --env-file=.env.local scripts/cloudbase-deploy.mjs
node scripts/cloudbase-status.mjs --logs
```

The deploy script uses 0–1 replicas and a canary release. Review the actual record before promoting it with `tcb cloudrun traffic promote`. The first version of a new service may automatically receive traffic even when canary deployment was requested. Never equate a submitted build with a healthy published site.

Provider default domains have a development notice and download-related restrictions. Use a properly filed custom domain for production; do not attempt to remove provider-enforced restrictions in application code.

## Evidence

`cloudbase-live-check.mjs` uses two synthetic staging identities to exercise hosted RLS, moderation, comments/bookmarks, reports and wall limits. `cloudbase-browser-auth.cjs` verifies actual browser sign-in/out and persistence. `cloudbase-browser-check.cjs` checks real routes and four widths. Results and screenshots stay under ignored `artifacts/release`; account credentials are private local artifacts and must never be committed or uploaded.

Local passing tests, local preview, hosted API tests, public browser tests and independent mainland network probes are separate evidence. No test establishes permanent availability across all mainland ISPs.
