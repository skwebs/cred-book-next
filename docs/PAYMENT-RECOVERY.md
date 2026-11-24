# Payment deletion and recovery

Payments are archived instead of physically deleted. The `bill_payments.deleted_at` timestamp marks an archived payment; `deleted_reason` records the reason. Archived payments remain available in the Payments screen under **Deleted Payments**, but are excluded from payment allocation and statement paid/outstanding calculations.

Archiving removes the payment's allocations and rebalances the card's remaining active payments against statements in cycle order. Restoring clears the archive fields and performs the same allocation rebalance. Editing an archived payment is rejected until it is restored.

## Apply the database migration

Run this from the project root against the same database configured in `.env.local`:

```sh
npm run db:migrate:apply
```

The migration is `db/migrations/006_soft_delete_bill_payments.sql` and is safe to apply more than once. Back up the database before applying production migrations.
