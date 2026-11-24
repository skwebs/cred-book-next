# Dashboard billing calculation

The dashboard uses three separate dates for three separate purposes:

- `settlement_date` assigns each transaction to that card's billing cycle.
- `statement_date` determines the month in which the generated bill is reported.
- `due_date` is the payment deadline only; it never determines the reporting month.

## Monthly billed amount

For the selected calendar month M, **Previous month billed** is the sum of the original face value (`bill_amount_minor`) of every statement whose `statement_date` falls in M and is not in the future. This includes statements whose due date falls in the following month. Payments never reduce this figure.

Example: a HDFC-style card closes its 1 Oct–31 Oct cycle at the end of 31 Oct. Its statement is generated on 1 Nov and has a due date of 20 Nov. The full statement amount belongs to November. A statement generated on 16 Nov with a 5 Dec due date also belongs to November.

## Unpaid bill

**Unpaid bill** is the sum of outstanding balances for all statements generated on or before today, across all months. It includes unpaid and partially paid older statements until their remaining balances are cleared.

For each statement:

`outstanding = max(0, bill_amount_minor - allocated_payments)`

A full payment makes outstanding zero; a partial payment reduces outstanding only by the allocated amount. The original billed amount remains unchanged.

## Current-cycle expenses

The second overview card sums transactions settled on or before today whose card-specific billing cycle starts in the current calendar month. These expenses will become a statement in a later month. Payments do not reduce this spending figure.

## Card-specific cycle rules

Each card's `billing_day`, `billing_rule` (`start` or `end`) and `due_days` are evaluated independently. For `end`, the billing day is included in the closing cycle and the statement is generated the following day. For `start`, the billing day begins the new cycle and the statement is generated on that date. The existing due-date convention is preserved: `due_date = cycle_end + due_days`, which produces 20 Nov for the example 31 Oct close with 20 due days.

## Payment allocation

Payments are allocated FIFO to the card's oldest outstanding statements that had already been generated on the payment date. A payment cannot be allocated to a statement that did not yet exist on that date. Deleted payments are excluded; restoring or editing a payment triggers allocation recalculation. Any unapplied amount remains unallocated rather than silently reducing a future statement.

On the first API bootstrap after this update, a versioned one-time reallocation rebuilds `payment_allocations` for every card using the payment-date rule. Payment records and statement records are preserved; only their allocation rows are recalculated. No schema migration is required.
