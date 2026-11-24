# Billing-cycle selector two-row layout

Updated only the two requested card-details workflows.

## 1. Card details — Billing cycle selector
File: `src/App.tsx`

- First row: card name plus the `Current cycle` prefix/status.
- Second row: date range only.
- Historical statement rows retain their existing date range and amount.
- Selection state, statement identifiers, calculations, and click handlers are unchanged.

## 2. Download statement — Billing cycle selection
File: `src/legacy-pages/views/StatementExportDialog.tsx`

- Current cycle first row label: `<card name> · Current`.
- Second row description: date range only.
- Historical statement labels and date ranges are unchanged.
- Export selection and settlement-date export logic are unchanged.

No shared `SelectionSheet` component styles were changed, so unrelated selectors retain their existing appearance.
