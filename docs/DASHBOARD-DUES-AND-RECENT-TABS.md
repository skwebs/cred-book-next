# Dashboard Dues Bill and Recent Spent Tabs

- Replaced the standalone Recent Transactions section with a compact two-tab activity panel.
- Both tabs stay visible in one horizontal row; each tab places its label and amount on the same line.
- **Dues Bill** amount is the sum of positive outstanding balances across generated statements. Its details list up to five outstanding statements ordered by due date, with card name, due date, and outstanding amount. Selecting a statement opens its card in the Cards area.
- **Recent Spent** amount is the sum of the five most recent transactions shown in its details. The existing transaction rows and actions are reused.
- The selected tab's details appear below the tabs. No billing or transaction calculation logic was changed.
