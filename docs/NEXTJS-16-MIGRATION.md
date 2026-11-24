# Cred Book — Next.js 16 framework migration

**Status:** framework migration baseline; production cutover is not approved until the verification checklist below passes.

## Goals and preservation rules

- Next.js 16 App Router is the framework and deployment entry point.
- Existing React UI, CSS, React Router URL model, query cache, business calculations, PostgreSQL schema, SQL, authentication, receipt storage, IndexedDB cache and PWA files are retained.
- No shadcn/ui, React Hook Form or Zod redesign is included in this migration.
- Do not change billing-cycle, statement reconciliation, payment allocation, paise arithmetic, date handling, authentication or API response contracts as part of framework migration.
- Keep the previous Vite archive and production deployment available for rollback.

## Runtime and package policy

- Node.js: `>=24.17.0` (the project's existing runtime floor is retained; Next.js 16 itself documents Node.js 20.9+).
- Next.js: `^16.0.0` (latest compatible 16.x release is resolved and pinned in `package-lock.json` when dependencies are installed).
- React / React DOM: retain the existing React 19 line and keep both versions aligned.
- TypeScript: 5.9.3 (existing tested project compiler line retained).
- Tailwind CSS: v4 using the official `@tailwindcss/postcss` integration.
- Do not copy package versions from old tutorials. Before changing dependencies, check the official version-matched documentation and peer dependency ranges, update package-lock with `npm install`, then run typecheck, build and feature tests.

## Architecture during this migration

### Frontend routing

`src/app/[[...path]]/page.tsx` delegates to `src/components/app-client.tsx`, which dynamically loads the existing React Router application with SSR disabled. This is deliberate: it preserves existing nested routes, browser history, route modals and persistent AppShell state. The Next.js catch-all route serves the existing app at the root and application URLs. Do not create conflicting App Router page routes until a route is deliberately migrated and tested.

### API compatibility

`src/app/api/route.ts` adapts Next.js Node Route Handler requests/responses to the existing `api/index.ts` Node handler. The adapter preserves the current `/api?action=...` contract and streams request bodies to the existing Busboy multipart parser. The API runs in the Node.js runtime; do not move it to Edge.

### CSS

`src/app/globals.css` imports Tailwind v4 and the existing `src/style.css`. The existing visual system is intentionally unchanged. `src/index.css` is not imported because it is the unused Vite starter stylesheet and defines conflicting root sizing/theme defaults.

### PWA

The existing manifest, icons and service worker are retained. Review `public/sw.js` cache version and navigation fallback after each production deployment. The service worker must never cache `/api` responses, authenticated financial data or private receipt content. Next.js hashed assets can be cached, but stale app-shell behaviour must be tested on an installed device.

## Environment variables

Copy `.env.example` to `.env.local` and set server-only values:

- `DATABASE_URL`
- `SESSION_SECRET` (at least 32 random characters)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, optional `R2_ENDPOINT`
- `APP_TIME_ZONE=Asia/Kolkata`

Never prefix secrets with `NEXT_PUBLIC_`. Use a separate Neon test database for development and preview deployments.

## Local setup

```bash
node --version
npm install
cp .env.example .env.local
# Edit .env.local with test-only credentials
npm run typecheck
npm run test:billing
npm run dev
```

Open `http://localhost:3000`. The app's current client-side status/setup/login flow still requires the API and test Neon database.

## Verification before production

1. `npm ci` completes from the committed lockfile.
2. `npm run typecheck` passes.
3. `npm run build` passes on the deployment Node version.
4. `npm run test:billing` passes.
5. API smoke tests: status, setup, login, logout, CSRF rejection, bootstrap, cards, transactions, statements, payments and settings.
6. Multipart receipt upload/view/delete works through the Route Handler adapter and R2 remains private.
7. Browser Back/Forward, direct deep links, refresh, route modals and modal close behaviour work.
8. IndexedDB cache restore, offline read-only mode, reconnect refresh and logout cache clearing work.
9. Installed PWA updates to the latest app shell; `/api` and receipts are never cached.
10. Compare billing-cycle boundaries, statement totals, partial payments, overpayments, advance credit and paise totals against the source build.
11. Test light/dark mode, responsive layouts, and the latest billing-cycle two-row UI fix.
12. Deploy a Vercel Preview using a test Neon database; do not cut over production until all checks pass and the owner approves.

## Official documentation references

- Next.js 16 upgrade guide: https://nextjs.org/docs/app/guides/upgrading/version-16
- Next.js App Router installation: https://nextjs.org/docs/app/getting-started/installation
- Next.js Route Handlers: https://nextjs.org/docs/app/api-reference/file-conventions/route
- Next.js project structure: https://nextjs.org/docs/app/getting-started/project-structure
- Tailwind CSS v4 with Next.js: https://tailwindcss.com/docs/installation/framework-guides/nextjs
- Next.js Proxy convention (only if later needed): https://nextjs.org/docs/app/api-reference/file-conventions/proxy

Always prefer the official documentation for the installed major/minor version. Re-check release notes and peer dependencies before upgrades; never assume a blog post written for Next.js 13–15 applies to Next.js 16.

## Known migration boundary

This is intentionally a low-risk framework migration, not a conversion to native Server Components or native App Router feature routes. Existing screens continue to run client-side inside React Router. A later incremental route migration can remove React Router one route at a time, but only after parity tests exist.
