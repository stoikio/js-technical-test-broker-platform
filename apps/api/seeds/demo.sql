-- Demo data set, loaded into an empty database when SEED_DEMO_DATA=true.
-- Dates are relative to the day the seed runs so the data always looks current.

INSERT INTO companies (id, name, registration_number, created_at) VALUES
  ('5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c01', 'Northwind Logistics', 'NW482913', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-95 days')),
  ('5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c02', 'Bluebird Dental', 'BD730146', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-80 days')),
  ('5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c03', 'Atlas Freight', 'AF218604', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-75 days')),
  ('5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c04', 'Summit Clinics', 'SC905371', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-40 days')),
  ('5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c05', 'Orchard Veterinary', 'OV664082', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-21 days')),
  ('5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c06', 'Harbor Bakery', 'HB117359', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-12 days')),
  ('5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c07', 'Granite Works', 'GW771204', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-6 days')),
  ('5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c08', 'Lumen Architects', 'LA350918', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 days'));

INSERT INTO quotes (id, company_id, units, unit_price_amount, currency, status, created_at, accepted_at) VALUES
  ('7c2e8b63-1d5f-4a9b-8e72-4f3a8b9c0d01', '5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c01', 40, 9500, 'EUR', 'accepted', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-85 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-70 days')),
  ('7c2e8b63-1d5f-4a9b-8e72-4f3a8b9c0d02', '5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c02', 12, 12000, 'EUR', 'accepted', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-70 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-45 days')),
  ('7c2e8b63-1d5f-4a9b-8e72-4f3a8b9c0d03', '5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c03', 25, 11000, 'EUR', 'accepted', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-60 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-50 days')),
  ('7c2e8b63-1d5f-4a9b-8e72-4f3a8b9c0d04', '5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c04', 60, 8250, 'EUR', 'accepted', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-20 days')),
  ('7c2e8b63-1d5f-4a9b-8e72-4f3a8b9c0d05', '5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c05', 8, 15000, 'EUR', 'accepted', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-15 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 days')),
  ('7c2e8b63-1d5f-4a9b-8e72-4f3a8b9c0d06', '5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c06', 15, 9000, 'EUR', 'open', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-10 days'), NULL),
  ('7c2e8b63-1d5f-4a9b-8e72-4f3a8b9c0d07', '5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c06', 15, 8500, 'EUR', 'open', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-4 days'), NULL),
  ('7c2e8b63-1d5f-4a9b-8e72-4f3a8b9c0d08', '5b1d6a52-0c4e-4f8a-9d61-3e2f7a8b9c07', 30, 10000, 'EUR', 'open', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-3 days'), NULL);

INSERT INTO contracts (id, company_id, quote_id, units, unit_price_amount, currency, start_on, end_on, created_at)
SELECT
  replace(quotes.id, '7c2e8b63', '9e4a0d85'),
  quotes.company_id,
  quotes.id,
  quotes.units,
  quotes.unit_price_amount,
  quotes.currency,
  date(quotes.accepted_at),
  date(quotes.accepted_at, '+1 year', '-1 day'),
  quotes.accepted_at
FROM quotes
WHERE quotes.status = 'accepted';

-- One invoice per contract, issued on its start date, numbered in sequence within each year.
INSERT INTO invoices (id, number, contract_id, company_id, billed_to, amount, currency, issued_on, due_on)
SELECT
  replace(contracts.id, '9e4a0d85', 'b3f6c2a7'),
  'INV-' || strftime('%Y', contracts.start_on) || '-' || printf('%04d', row_number() OVER (
    PARTITION BY strftime('%Y', contracts.start_on) ORDER BY contracts.start_on
  )),
  contracts.id,
  contracts.company_id,
  companies.name,
  contracts.units * contracts.unit_price_amount,
  contracts.currency,
  contracts.start_on,
  date(contracts.start_on, '+30 days')
FROM contracts
JOIN companies ON companies.id = contracts.company_id;

-- Northwind paid in full, Bluebird paid half, Atlas paid and was refunded,
-- and the last payment has not been applied to any invoice yet.
INSERT INTO payments (id, amount, currency, received_on, recorded_at) VALUES
  ('d8a1e4f2-3b6c-4d9e-8f07-5a2b3c4d5e01', 380000, 'EUR', date('now', '-52 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-51 days')),
  ('d8a1e4f2-3b6c-4d9e-8f07-5a2b3c4d5e02', 72000, 'EUR', date('now', '-15 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-14 days')),
  ('d8a1e4f2-3b6c-4d9e-8f07-5a2b3c4d5e03', 275000, 'EUR', date('now', '-30 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-29 days')),
  ('d8a1e4f2-3b6c-4d9e-8f07-5a2b3c4d5e04', -275000, 'EUR', date('now', '-22 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-22 days')),
  ('d8a1e4f2-3b6c-4d9e-8f07-5a2b3c4d5e05', 50000, 'EUR', date('now', '-3 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 days'));

INSERT INTO payment_applications (id, payment_id, invoice_id, amount, currency, applied_at) VALUES
  ('f1c3e5a7-9b2d-4f6a-8c0e-1a3b5c7d9e01', 'd8a1e4f2-3b6c-4d9e-8f07-5a2b3c4d5e01', 'b3f6c2a7-1d5f-4a9b-8e72-4f3a8b9c0d01', 380000, 'EUR', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-51 days')),
  ('f1c3e5a7-9b2d-4f6a-8c0e-1a3b5c7d9e02', 'd8a1e4f2-3b6c-4d9e-8f07-5a2b3c4d5e02', 'b3f6c2a7-1d5f-4a9b-8e72-4f3a8b9c0d02', 72000, 'EUR', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-14 days')),
  ('f1c3e5a7-9b2d-4f6a-8c0e-1a3b5c7d9e03', 'd8a1e4f2-3b6c-4d9e-8f07-5a2b3c4d5e03', 'b3f6c2a7-1d5f-4a9b-8e72-4f3a8b9c0d03', 275000, 'EUR', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-29 days')),
  ('f1c3e5a7-9b2d-4f6a-8c0e-1a3b5c7d9e04', 'd8a1e4f2-3b6c-4d9e-8f07-5a2b3c4d5e04', 'b3f6c2a7-1d5f-4a9b-8e72-4f3a8b9c0d03', -275000, 'EUR', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-22 days'));
