import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '#src/app.ts';
import { StubClock } from '#src/core/infra/adapters/clock.stub.ts';
import { openDatabase } from '#src/core/infra/sqlite/database.ts';
import { migrate } from '#src/core/infra/sqlite/migrator.ts';
import { seedDemoData } from '#src/seed.ts';

const MIGRATIONS = fileURLToPath(new URL('../migrations', import.meta.url));
const SEED_FILE = fileURLToPath(new URL('../seeds/demo.sql', import.meta.url));

type ErrorBody = { error: { code: string } };

const setup = () => {
  const database = openDatabase(':memory:');
  migrate(database, MIGRATIONS);
  const clock = new StubClock();
  clock.currentDate = new Date('2026-06-01T09:00:00.000Z');
  const app = createApp({ database, clock });

  const call = async <Response = { id: string; [key: string]: unknown }>(
    method: string,
    path: string,
    body?: unknown,
  ) => {
    const response = await app.request(path, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: (await response.json()) as Response };
  };

  return { database, call };
};

describe('API', () => {
  let api: ReturnType<typeof setup>;

  beforeEach(() => {
    api = setup();
  });

  it('turns an accepted quote into a contract and an invoice, then settles it', async () => {
    const company = await api.call('POST', '/companies', {
      name: 'Granite Works',
      registrationNumber: 'GW771204',
    });
    expect(company.status).toBe(201);

    const quote = await api.call('POST', `/companies/${company.body.id}/quotes`, {
      units: 4,
      unitPrice: { amount: 250_00, currency: 'EUR' },
    });
    expect(quote.body.total).toEqual({ amount: 1_000_00, currency: 'EUR' });
    expect((await api.call('GET', '/prospects')).body).toHaveLength(1);

    const contract = await api.call('POST', `/quotes/${quote.body.id}/accept`);
    expect(contract.status).toBe(201);
    expect(contract.body).toMatchObject({ startOn: '2026-06-01', endOn: '2027-05-31' });
    expect((await api.call('GET', '/prospects')).body).toHaveLength(0);
    expect((await api.call('GET', '/clients')).body).toHaveLength(1);

    const invoices = await api.call<{ id: string }[]>(
      'GET',
      `/invoices?companyId=${company.body.id}`,
    );
    expect(invoices.body).toEqual([
      expect.objectContaining({
        number: 'INV-2026-0001',
        contractId: contract.body.id,
        billedTo: 'Granite Works',
        amount: { amount: 1_000_00, currency: 'EUR' },
        dueOn: '2026-07-01',
        paymentState: 'unpaid',
      }),
    ]);
    const invoiceId = invoices.body[0]?.id;

    const payment = await api.call('POST', '/payments', {
      amount: { amount: 1_000_00, currency: 'EUR' },
      receivedOn: '2026-05-30',
    });
    expect(payment.status).toBe(201);

    const application = await api.call(
      'POST',
      `/payments/${payment.body.id}/applications`,
      {
        invoiceId,
        amount: 600_00,
      },
    );
    expect(application.status).toBe(201);

    const invoice = await api.call('GET', `/invoices/${invoiceId}`);
    expect(invoice.body).toMatchObject({
      paidAmount: { amount: 600_00, currency: 'EUR' },
      outstandingAmount: { amount: 400_00, currency: 'EUR' },
      paymentState: 'partially_paid',
      applications: [{ paymentId: payment.body.id, paymentReceivedOn: '2026-05-30' }],
    });

    const overApplied = await api.call<ErrorBody>(
      'POST',
      `/payments/${payment.body.id}/applications`,
      {
        invoiceId,
        amount: 400_01,
      },
    );
    expect(overApplied.status).toBe(409);
    expect(overApplied.body.error.code).toBe('billing.payment.amountExceedsUnapplied');
  });

  it('refuses to accept a quote twice', async () => {
    const company = await api.call('POST', '/companies', {
      name: 'Lumen Architects',
      registrationNumber: 'LA350918',
    });
    const quote = await api.call('POST', `/companies/${company.body.id}/quotes`, {
      units: 1,
      unitPrice: { amount: 100_00 },
    });
    await api.call('POST', `/quotes/${quote.body.id}/accept`);

    const second = await api.call('POST', `/quotes/${quote.body.id}/accept`);

    expect(second.status).toBe(409);
    expect((await api.call('GET', '/invoices')).body).toHaveLength(1);
  });

  it('validates request bodies', async () => {
    const response = await api.call<ErrorBody>('POST', '/payments', {
      amount: { amount: 'ten' },
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('core.badRequest');
  });

  it('keeps issued invoices and payments append-only in the database', async () => {
    seedDemoData(api.database, SEED_FILE);

    expect(() => api.database.exec('UPDATE invoices SET amount = 1')).toThrow(
      /immutable/,
    );
    expect(() => api.database.exec('DELETE FROM payments')).toThrow(/append-only/);
  });

  it('loads a consistent demo data set', async () => {
    expect(seedDemoData(api.database, SEED_FILE)).toBe(true);
    expect(seedDemoData(api.database, SEED_FILE)).toBe(false);

    const invoices = (
      await api.call<{ billedTo: string; paymentState: string }[]>('GET', '/invoices')
    ).body;
    const states = Object.fromEntries(
      invoices.map((invoice) => [invoice.billedTo, invoice.paymentState]),
    );
    expect(states).toEqual({
      'Northwind Logistics': 'paid',
      'Bluebird Dental': 'partially_paid',
      'Atlas Freight': 'unpaid',
      'Summit Clinics': 'unpaid',
      'Orchard Veterinary': 'unpaid',
    });

    const payments = (
      await api.call<
        { amount: { amount: number }; unappliedAmount: { amount: number } }[]
      >('GET', '/payments')
    ).body;
    expect(payments.some((payment) => payment.amount.amount < 0)).toBe(true);
    expect(
      payments.filter((payment) => payment.unappliedAmount.amount !== 0),
    ).toHaveLength(1);
  });
});
