# UI fixes — 19 Nov 2026

Changes applied on top of Cred Book v25:

- Standardized the corner radius for app modal surfaces and selection sheets to 1.5rem so stacked dialogs use matching geometry.
- Changed billing-cycle choices to render the card nickname on the first line and the cycle date range on the second line. The active cycle keeps its Active indicator and historical cycles retain their amount.
- Added a dedicated card-list icon class with a higher-contrast violet treatment in light mode while retaining a suitable dark-mode treatment.
- Kept the Add card action on one line and prevented its plus icon or label from shrinking/wrapping.

Build verification: `npm run build` could not complete in this environment because the dependency installation timed out. The subsequent build reports missing `vite/client` and `node` type definitions. The environment uses Node 22.16.0, while this project declares Node >=24.17.0. Run `npm ci` under a supported Node 24.17+ environment, then `npm run build`.
