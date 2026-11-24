# Statement generation month reconciliation

## Root cause

Existing statement rows were inserted with `ON CONFLICT(card_id, cycle_start, cycle_end) DO NOTHING`. If an earlier application version stored an incorrect `statement_date` or `due_date`, later bootstrap calls left that metadata unchanged. The dashboard attributes billed amount using `statement_date`, while outstanding amount is calculated from statement balances, so the same HDFC statement could be included in outstanding but excluded from the monthly billed total.

## Fix

- Reconstruct statement and due dates from the card billing rule for each persisted cycle.
- Repair dates only when the stored cycle boundaries still match the card's current billing configuration. This avoids rewriting historical cycles after a user changes card settings.
- Rebuild that card's payment allocations after any date repair because payment eligibility is based on statement generation date.
- Keep statement face value, confirmed bank amount, lock state, and payment history intact.

## Regression

HDFC TATA NEU with billing day 31, end-of-day rule, and 20 due days:

- Cycle: 1 Oct 2026 – 31 Oct 2026
- Statement generation: 1 Nov 2026
- Due date: 20 Nov 2026
- Statement amount: ₹3,932

When combined with other November statements totalling ₹9,948 and no payments, November billed and outstanding totals must both be ₹13,880.

Run `npm run test:billing` to execute the regression.
