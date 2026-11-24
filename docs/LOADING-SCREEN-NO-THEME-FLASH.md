# Loading screen: prevent initial dark-theme flash

## Observed issue
The saved light theme was eventually applied, but the first loading frame still painted with the fallback's dark defaults. The prior bootstrap used `next/script` with `beforeInteractive`; in this observed browser startup it did not prevent the first paint.

## Fix
- Replaced the Next Script wrapper with a native synchronous inline script directly in the document head.
- The script reads the same `ccm-theme` localStorage preference used by the React app and applies `data-theme` plus `color-scheme`.
- Added a tiny head style that keeps the body hidden only while the root theme attribute is unresolved. The synchronous head script resolves the theme before the body is parsed and displayed.
- Updates the existing theme-color meta tag to match the selected theme.
- If storage access fails, the bootstrap explicitly resolves to the app's existing dark default.

No loading-screen design, app routes, application state, APIs, financial logic, or stored preference key changed.
