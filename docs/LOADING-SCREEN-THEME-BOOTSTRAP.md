# Loading screen light/dark theme bootstrap

## Root cause
The branded loading fallback is rendered before the dynamically imported React application mounts. The saved theme (`ccm-theme`) was previously read by the app only after that point, so the loading fallback initially used its dark defaults even when Light or System was selected.

## Fix
- Added a tiny `next/script` `beforeInteractive` bootstrap in `src/app/layout.tsx`.
- Reads the existing `ccm-theme` preference before the loading fallback paints.
- Supports saved `light`, `dark`, and `system`; missing or inaccessible storage retains the app's existing dark default.
- Writes the resolved mode to `html[data-theme]` and `color-scheme`.
- Updated loading fallback CSS to use the early HTML theme attribute.
- The existing React app continues to own the theme setting and writes to the same `ccm-theme` key.

No application routes, API, financial logic, data loading, or normal app theme controls were changed.
