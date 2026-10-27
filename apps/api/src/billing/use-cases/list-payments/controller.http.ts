import type { Hono } from 'hono';

import { PaymentMapper } from '#src/billing/infra/mappers/payment.mapper.ts';
import type { ListPaymentsUseCase } from '#src/billing/use-cases/list-payments/use-case.ts';

export class HttpListPaymentsController {
  private readonly useCase: ListPaymentsUseCase;

  constructor(useCase: ListPaymentsUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.get('/payments', async (c) => {
      const { payments, applications } = await this.useCase.execute();

      return c.json(
        payments.map((payment) => PaymentMapper.toHttp(payment, applications)),
      );
    });
  }
}
