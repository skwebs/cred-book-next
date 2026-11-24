# Migration notes: Cred Book 2.1.0

## Vite to Next.js 16
- Replaced the Vite application entry point with the Next.js 16 App Router.
- Preserved the existing React Router application inside a Next.js catch-all client page to avoid changing URL/history/modal behaviour during the framework migration.
- Added a Node.js Route Handler adapter that delegates to the existing API implementation and preserves `/api?action=...` contracts, including streamed multipart receipt uploads and downloads.
- Retained the existing UI, CSS, business calculations, PostgreSQL schema, auth/session implementation, IndexedDB cache and PWA assets.
- Replaced the Vite Tailwind plugin with the official Tailwind CSS v4 PostCSS integration.
- Removed Vite configuration and SPA fallback rewrites.
- Added `docs/NEXTJS-16-MIGRATION.md` with runtime policy, official version-matched documentation, setup instructions and production acceptance criteria.

## Install and verify
Use Node.js 24.17+ (project engine), then run:

```bash
npm install
npm run typecheck
npm run test:billing
npm run build
```

The package lockfile must be generated in the supported Node/npm environment (`npm install`) because package-registry access was unavailable during this migration run. Do not use `npm ci` until the newly generated lockfile has been committed.

## Safety boundary
This is a framework migration, not a UI redesign or database migration. Do not run schema changes against production. Use a separate Neon test database and complete the checklist in `docs/NEXTJS-16-MIGRATION.md` before cutover.
