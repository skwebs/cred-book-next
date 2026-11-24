# Next.js 16 migration follow-up: TypeScript and Android/Termux build

## Issues observed in the first user-side verification

The first install completed and the billing regression suite passed. Two migration-specific issues remained:

1. The legacy API was originally compiled under a separate Vite/Vercel TypeScript configuration. Including it in the new single Next.js TypeScript project exposed pre-existing implicit-`any`, nullable-session, and empty-array inference diagnostics. These diagnostics do not indicate a change to the SQL or financial calculation behaviour.
2. Next.js 16 selected Turbopack by default. Native Turbopack bindings are not available for the user's Android ARM64/Termux runtime, so `next build` and `next dev` must explicitly use Webpack on that environment.

## Changes in this follow-up

- `npm run dev` now runs `next dev --webpack --hostname 0.0.0.0`.
- `npm run build` now runs `next build --webpack`.
- Explicit array parameter types were added to the legacy SQL helpers to prevent `never[]` inference.
- The old Vite basename expressions that were always truthy were simplified.
- TypeScript compatibility options are scoped in `tsconfig.json` for the migrated legacy API. Keep improving API types incrementally; do not silence new errors in newly written feature code.
- No database schema, API action, financial calculation, or UI workflow was intentionally changed.

## Verify on Node.js 24.17+

```bash
npm run typecheck
npm run test:billing
npm run build
npm run dev
```

If a port is already occupied, Next.js will select the next available port. Stop the old process if you specifically need port 3000.

## Important

The npm deprecation warnings for `inflight`, `rimraf@2`, `lodash.isequal`, `glob@7`, and `fstream` are transitive dependency warnings from the resolved dependency tree. They are not evidence that the app is using those packages directly. Do not force arbitrary overrides for them: first identify the parent dependency with `npm explain <package>`, then update the owning dependency when a compatible release exists.

The initial `npm install` reported zero vulnerabilities. Re-run `npm audit` after installing this follow-up and review any new report before deployment.
