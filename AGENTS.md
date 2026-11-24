# Repository instructions for AI coding agents

## Documentation and dependency currency

- This repository targets Next.js 16 App Router and Tailwind CSS 4. Do not generate Vite configuration, `next lint`, legacy Middleware examples, Pages Router patterns, Tailwind v3 directives, or deprecated package APIs.
- Before using or changing a Next.js, React, Tailwind, Vercel, Neon, AWS SDK, or other package API, consult its current official documentation for the installed major version. Prefer version-matched official docs over blog posts, snippets, memory, or older examples.
- Verify package compatibility using package peer dependencies and official upgrade/release notes. Do not claim a package is latest unless its registry version was checked in the current environment.
- Keep `package.json` and `package-lock.json` synchronized. Use `npm install` to update the lockfile and `npm ci` for reproducible CI after a lockfile exists. Never hand-edit lockfile package resolutions.
- Do not upgrade packages opportunistically while fixing unrelated bugs. Make dependency upgrades explicit, then run typecheck, lint, tests and production build.

## Application safety

- Preserve existing billing-cycle calculations, integer-paise arithmetic, statement reconciliation, payment allocation, authentication, CSRF, API response shapes, IndexedDB cache and offline behaviour.
- Do not change database schema or production data without explicit approval and a verified backup.
- Preserve existing UI and responsive behaviour unless a change is explicitly requested.
- Run `npm run test:billing`, `npm run typecheck` and `npm run build` after relevant changes. Record any check that cannot run and why; never claim success without output.
- Keep all secrets server-only. Never expose `DATABASE_URL`, `SESSION_SECRET` or R2 credentials through `NEXT_PUBLIC_*` variables.
