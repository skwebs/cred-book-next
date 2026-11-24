# Bottom navigation changes

Only the requested navigation changes were made.

- Reduced bottom-navigation label text from 11px to 10px.
- Added the Cards destination using the existing `/cards` route.
- Moved the add-transaction action to the center of the bottom navigation.
- Removed the floating add buttons from Dashboard, Transactions, and Card details.
- The center action retains the selected card context when launched from Card details.
- Kept the inline `Add Transaction` button on the Card details summary card.
- Restored the existing `Active` indicator in the current billing-cycle selector. `Current cycle` remains on the first row and the date range alone on the second row.

No billing calculations, APIs, or database code were changed.
