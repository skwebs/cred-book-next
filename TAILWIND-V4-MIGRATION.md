# Tailwind CSS v4 integration

Cred Book now uses the official Tailwind CSS v4 PostCSS integration required by the Next.js App Router build:

- `tailwindcss` is a development dependency.
- `@tailwindcss/postcss` is registered in `postcss.config.mjs`.
- `src/app/globals.css` imports `tailwindcss` and the existing `src/style.css`.
- The former Vite-specific `@tailwindcss/vite` plugin has been removed.

Official guide: https://tailwindcss.com/docs/installation/framework-guides/nextjs

Do not add the old `@tailwindcss/vite` integration to this Next.js project.
