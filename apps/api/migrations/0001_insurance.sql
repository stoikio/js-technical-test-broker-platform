CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE quotes (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies (id),
  units INTEGER NOT NULL CHECK (units > 0),
  unit_price_amount INTEGER NOT NULL CHECK (unit_price_amount > 0),
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'accepted')),
  created_at TEXT NOT NULL,
  accepted_at TEXT
);

CREATE INDEX quotes_company_id_idx ON quotes (company_id);

CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies (id),
  quote_id TEXT NOT NULL UNIQUE REFERENCES quotes (id),
  units INTEGER NOT NULL CHECK (units > 0),
  unit_price_amount INTEGER NOT NULL CHECK (unit_price_amount > 0),
  currency TEXT NOT NULL,
  start_on TEXT NOT NULL,
  end_on TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX contracts_company_id_idx ON contracts (company_id);
