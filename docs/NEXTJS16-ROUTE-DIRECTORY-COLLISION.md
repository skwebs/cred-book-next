# Next.js 16 route-directory collision fix

## Root cause

The original application uses React Router and keeps its screen modules under
`src/pages/`. In a Next.js project, `src/pages/` is a reserved Pages Router
directory. Next.js therefore attempted to treat every file under that folder
as a route. The shared module `views/view-types.ts` has no default page export,
so Next generated an invalid `PagesPageConfig` type check for it.

## Change

- Renamed the existing React Router screen-module directory from
  `src/pages/` to `src/legacy-pages/`.
- Updated the lazy imports in `src/App.tsx` to point to `./legacy-pages/`.
- Kept the contents and relative imports inside those modules unchanged.
- Kept `src/app/` as the only Next.js route directory.

This is a framework-structure correction. It does not change the React Router
route definitions, UI components, API handlers, database logic, or billing
calculations.

## Clean verification in Termux

Stop the running dev server first (`Ctrl+C`), then run:

```bash
rm -rf .next
npm run typecheck
npm run test:billing
npm run build
npm run dev
```

Deleting `.next` is important because Next.js generated route types from the
old directory may remain in the cache until a clean build.

Expected result:
- `typecheck` completes without the generated `PagesPageConfig` error.
- Billing regression tests continue to pass.
- `build` uses Webpack (required for the current Termux ARM64 environment).

If a new error appears, share the complete output. Do not remove generated type
checks or add broad TypeScript suppressions to work around it.
