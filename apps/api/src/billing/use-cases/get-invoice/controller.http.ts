import type { Hono } from 'hono';

import { InvoiceMapper } from '#src/billing/infra/mappers/invoice.mapper.ts';
import { PaymentApplicationMapper } from '#src/billing/infra/mappers/payment-application.mapper.ts';
import type { GetInvoiceUseCase } from '#src/billing/use-cases/get-invoice/use-case.ts';

export class HttpGetInvoiceController {
  private readonly useCase: GetInvoiceUseCase;

  constructor(useCase: GetInvoiceUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.get('/invoices/:invoiceId', async (c) => {
      const { balance, payments } = await this.useCase.execute({
        invoiceId: c.req.param('invoiceId'),
      });
      const receivedOnByPaymentId = new Map(
        payments.map((payment) => [payment.id, payment.getProps().receivedOn.toString()]),
      );

      return c.json({
        ...InvoiceMapper.toHttp(balance),
        applications: balance.applications.map((application) => ({
          ...PaymentApplicationMapper.toHttp(application),
          paymentReceivedOn: receivedOnByPaymentId.get(application.paymentId) ?? null,
        })),
      });
    });
  }
}
