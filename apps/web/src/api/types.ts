/** Response shapes of the API. Amounts are in minor units (cents). */

export type Money = { amount: number; currency: string };

export type Company = {
  id: string;
  name: string;
  registrationNumber: string;
  createdAt: string;
};

export type Prospect = Company & { openQuoteCount: number };

export type QuoteStatus = 'open' | 'accepted';

export type Quote = {
  id: string;
  companyId: string;
  units: number;
  unitPrice: Money;
  total: Money;
  status: QuoteStatus;
  createdAt: string;
  acceptedAt: string | null;
};

export type Contract = {
  id: string;
  companyId: string;
  quoteId: string;
  units: number;
  unitPrice: Money;
  total: Money;
  startOn: string;
  endOn: string;
  createdAt: string;
};

export type Client = Company & { latestContract: Contract; contractCount: number };

export type InvoicePaymentState = 'unpaid' | 'partially_paid' | 'paid';

export type Invoice = {
  id: string;
  number: string;
  contractId: string;
  companyId: string;
  billedTo: string;
  amount: Money;
  issuedOn: string;
  dueOn: string;
  paidAmount: Money;
  outstandingAmount: Money;
  paymentState: InvoicePaymentState;
};

export type PaymentApplication = {
  id: string;
  paymentId: string;
  invoiceId: string;
  amount: Money;
  appliedAt: string;
};

export type InvoiceDetail = Invoice & {
  applications: (PaymentApplication & { paymentReceivedOn: string | null })[];
};

/** `amount` is negative for money paid out, such as a refund. */
export type Payment = {
  id: string;
  amount: Money;
  receivedOn: string;
  recordedAt: string;
  appliedAmount: Money;
  unappliedAmount: Money;
};
