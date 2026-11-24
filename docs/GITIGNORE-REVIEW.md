# Git ignore review for the Next.js Cred Book project

Reviewed against the project root structure visible in the supplied screenshot and the current project archive.

## Ignored
- `node_modules/`: installed dependencies.
- `.next/`, `out/`, `build/`, `dist/`: generated framework/build output.
- `.vercel/`: local Vercel project metadata.
- `.env` and `.env.*`: credentials and environment-specific configuration.
- `.env.example` and `.env.sample` are explicitly allowed as safe templates.
- SQLite/database files and sidecar journals.
- Local attachment/upload directories and generated SQLite export archives.
- Coverage, tool caches, TypeScript build info, logs, OS files, and editor-local settings.

## Keep tracked
- `package.json` and `package-lock.json`: reproducible dependency installation.
- `next-env.d.ts`: Next.js TypeScript declarations.
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`.
- `api/`, `db/migrations/`, `docs/`, `public/`, `scripts/`, and `src/`.
- `.env.example`: placeholder-only environment template.

## Important security note
The screenshot shows a real `.env` file. `.gitignore` prevents new untracked `.env` files from being added, but does not remove a file already tracked by Git. Check:

```bash
git status --short
git ls-files .env
```

If `git ls-files .env` prints `.env`, untrack it without deleting the local file:

```bash
git rm --cached .env
```

Commit that removal. If real credentials were ever committed or pushed, rotate them; deleting the file from the latest commit is not sufficient.

## Lockfile note
The current source archive supplied for this update does not contain `package-lock.json` (it was excluded when that ZIP was assembled). The new `.gitignore` does not ignore it. Keep the existing local `package-lock.json` from your project and commit it.

## Validation
The ignore rules were checked against the visible project root and the available source archive. The `.env.example` exception is placed after `.env.*`, so it remains eligible for Git tracking.
