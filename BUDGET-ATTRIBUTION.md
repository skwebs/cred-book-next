# Monthly billing and budget attribution

Transactions are assigned to each card's billing cycle by `settlement_date`. Each card's
billing day and generation timing (`start` or `end`) are evaluated independently.

- `end`: the billing day is included in the closing cycle; the statement is generated the
  following day (e.g. 1 Oct–31 Oct, statement generated 1 Nov).
- `start`: the billing day begins the new cycle; the statement is generated on that day
  (e.g. 15 Oct–14 Nov, statement generated 15 Nov).

## Dashboard totals

- **Previous month billed**: sum of the immutable statement face values generated in the
  selected calendar month. `statement_date` is authoritative; cycle start, settlement date,
  transaction date and due date do not determine the reporting month.
- **Unpaid bill**: sum of outstanding balances for all statements generated on or before
  today. Partial and overdue balances carry forward until allocated payments clear them.
- **Next month expenses**: settlement-date transaction amounts in cycles that start in the
  current calendar month. Payments do not reduce this figure.
- **Calendar-month purchases**: existing frontend total based on transaction date.

A statement generated in November belongs to November even if its due date is in December.
Its original billed amount remains in November's billed total after payment. Payment
allocations reduce only the statement's outstanding balance.

Payments are allocated FIFO to outstanding statements generated on or before the payment
date. Earlier payments cannot be silently allocated to statements generated later. Any
unallocated payment balance remains visible as unallocated credit.

On the first API bootstrap after this update, a versioned one-time reallocation rebuilds
`payment_allocations` for every card using the payment-date rule. Transaction, statement and
payment records are preserved; only allocation rows are recalculated. No schema migration
is required.
