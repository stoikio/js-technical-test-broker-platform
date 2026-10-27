-- Billing references other contexts by id only: no foreign keys across contexts.

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  contract_id TEXT NOT NULL UNIQUE,
  company_id TEXT NOT NULL,
  billed_to TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL,
  issued_on TEXT NOT NULL,
  due_on TEXT NOT NULL
);

CREATE INDEX invoices_company_id_idx ON invoices (company_id);

-- Payment and application amounts are signed from the platform's point of view:
-- positive when money is received, negative when money is paid out (a refund).

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  amount INTEGER NOT NULL CHECK (amount <> 0),
  currency TEXT NOT NULL,
  received_on TEXT NOT NULL,
  recorded_at TEXT NOT NULL
);

CREATE TABLE payment_applications (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES payments (id),
  invoice_id TEXT NOT NULL REFERENCES invoices (id),
  amount INTEGER NOT NULL CHECK (amount <> 0),
  currency TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

CREATE INDEX payment_applications_payment_id_idx ON payment_applications (payment_id);
CREATE INDEX payment_applications_invoice_id_idx ON payment_applications (invoice_id);

-- Issued invoices, payments and their applications are append-only.

CREATE TRIGGER invoices_no_update BEFORE UPDATE ON invoices
BEGIN
  SELECT RAISE(ABORT, 'issued invoices are immutable');
END;

CREATE TRIGGER invoices_no_delete BEFORE DELETE ON invoices
BEGIN
  SELECT RAISE(ABORT, 'issued invoices are immutable');
END;

CREATE TRIGGER payments_no_update BEFORE UPDATE ON payments
BEGIN
  SELECT RAISE(ABORT, 'payments are append-only');
END;

CREATE TRIGGER payments_no_delete BEFORE DELETE ON payments
BEGIN
  SELECT RAISE(ABORT, 'payments are append-only');
END;

CREATE TRIGGER payment_applications_no_update BEFORE UPDATE ON payment_applications
BEGIN
  SELECT RAISE(ABORT, 'payment applications are append-only');
END;

CREATE TRIGGER payment_applications_no_delete BEFORE DELETE ON payment_applications
BEGIN
  SELECT RAISE(ABORT, 'payment applications are append-only');
END;
