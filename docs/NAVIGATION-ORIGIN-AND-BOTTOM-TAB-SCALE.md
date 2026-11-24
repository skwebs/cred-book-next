# Navigation origin and bottom-tab scale update

## Navigation behaviour
- The Cards listing route no longer displays the card-detail back action.
- The Cards listing header title is `Credit cards`.
- Card-detail navigation records whether the card was opened from Dashboard or Cards.
- While card details are open, the corresponding originating tab remains active.
- The header back action returns to that originating tab.
- Directly opened card-detail URLs default to the Cards tab and return to Cards.
- The internal `tab === 'card'` route classification remains intact for card-detail data loading and rendering.

## Bottom navigation scale
- Keeps the same fixed bottom position and five equal-width columns.
- Increases tab icon size to 24px and label size to 12px.
- Slightly increases the navigation content height without moving it from the bottom.
- Enlarges the central Add action to 68px with a 36px plus icon.
- Preserves existing colors, active-state treatment, routes, and click handlers.

Only App.tsx, DashboardView.tsx, CardsPage.tsx, and style.css were changed.
