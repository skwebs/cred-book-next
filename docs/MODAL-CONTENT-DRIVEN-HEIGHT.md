# Content-driven modal height

- Standard modal shells now use natural content height and grow only as far as the usable viewport allows.
- When a modal exceeds the available viewport, its content region scrolls while the modal header remains visible.
- Fixed-action modals retain their action footer while the information area is allowed to shrink and scroll.
- Card forms retain their existing layout and sticky save/cancel actions while no longer forcing a full-screen-height shell on phones.
- Transaction and payment detail routes now size to their content; long detail content scrolls inside the modal while the action footer remains visible.
- Desktop dialogs retain their existing centered presentation and viewport maximum.

No API, database, billing calculation, or transaction logic was changed.
