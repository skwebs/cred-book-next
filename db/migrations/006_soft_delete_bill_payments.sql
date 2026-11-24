ALTER TABLE bill_payments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE,
  ADD COLUMN IF NOT EXISTS deleted_reason TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_bill_payments_active_card_paid_at
  ON bill_payments(card_id, paid_at DESC, id DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_bill_payments_deleted_at
  ON bill_payments(deleted_at DESC)
  WHERE deleted_at IS NOT NULL;
