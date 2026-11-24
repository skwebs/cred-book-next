# Documentation index and authority

## Current authoritative documentation

1. [`NEXTJS-16-MIGRATION.md`](NEXTJS-16-MIGRATION.md) — current framework architecture, Node/package policy, official documentation links, setup and migration acceptance checklist.
2. [`BUILD-VERIFICATION-2026-11-23.md`](BUILD-VERIFICATION-2026-11-23.md) — exact checks run for this migration and checks still outstanding.
3. [`API-CONTRACT.md`](API-CONTRACT.md) — existing API contract; preserve its routes, actions and response formats unless a separately reviewed change is approved.
4. [`PRODUCTION-MIGRATION-SAFETY.md`](PRODUCTION-MIGRATION-SAFETY.md) — database and production cutover safeguards.

## Historical implementation notes

Other feature documents in this folder record the implementation decisions and fixes made against earlier project snapshots. They are retained as historical context and regression requirements. They are **not** authoritative instructions for framework setup, package versions, build commands, or current Next.js APIs.

For framework, package, build, routing, and Tailwind questions, follow the current migration document and version-matched official documentation. Do not copy old Vite, React Router migration, Tailwind v3, Pages Router, `next lint`, or legacy Middleware examples into the current application.
