# Build commands

Next.js 16 uses Turbopack by default. The standard scripts intentionally do not force a bundler:

- `npm run dev` — standard Next.js development server (Turbopack by default).
- `npm run build` — standard production build (Turbopack by default; suitable for Vercel).
- `npm run start` — starts the production server.

Use the explicit Webpack scripts only in environments where Turbopack is unavailable, such as the current Termux/WASM setup:

- `npm run dev:webpack`
- `npm run build:webpack`

Vercel's Next.js framework preset uses the `build` script from `package.json` when present. Keep that script as `next build` unless the deployment is intentionally configured to use Webpack.
