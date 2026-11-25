# Settings routes and Dashboard deduplication

## Settings URLs

- `/settings` — appearance, date format, and links to grouped settings.
- `/settings/financial` — card management, billing-cycle budget, categories, UPI apps, outstanding display, and payment allocation.
- `/settings/experience` — density and modal/page display behaviour.
- `/settings/storage` — receipt storage status and refresh action.
- `/settings/account` — account identity, password management, Help & Guide, and logout.
- `/settings/about` — application and installation information.

The Settings route outlet selects a dedicated page instance by pathname. All routes are registered explicitly with React Router, so direct navigation, refresh, and browser history use the URL as the source of truth.

## Dashboard

The individual Credit Cards listing has been removed from Dashboard. Monthly Overview remains unchanged. Individual card details and management remain in the Cards tab. No billing calculation or monthly overview calculation was changed.
