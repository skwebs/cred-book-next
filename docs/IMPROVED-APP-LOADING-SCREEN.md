# Improved Cred Book loading screen

Updated `src/components/app-client.tsx` and `src/style.css` only.

- Replaces the plain top-left loading text with a centered branded bootstrap screen.
- Adds a Cred Book card icon, short welcome message, finance dashboard skeleton, and clear loading status.
- Adapts to the existing `data-theme="light"` theme; dark remains the default before the app initializes.
- Uses CSS-only shimmer and spinner animations with reduced-motion support.
- Keeps the existing `next/dynamic` import and `ssr: false` application bootstrap behaviour unchanged.
- No app routes, data loading, API calls, authentication, or financial logic changed.
