import type { Hono } from 'hono';

import { PaymentMapper } from '#src/billing/infra/mappers/payment.mapper.ts';
import { HttpRecordPaymentBodyDto } from '#src/billing/use-cases/record-payment/dto.http.ts';
import type { RecordPaymentUseCase } from '#src/billing/use-cases/record-payment/use-case.ts';
import { parseInput, readJsonBody } from '#src/core/infra/http/validation.ts';

export class HttpRecordPaymentController {
  private readonly useCase: RecordPaymentUseCase;

  constructor(useCase: RecordPaymentUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.post('/payments', async (c) => {
      const body = parseInput(HttpRecordPaymentBodyDto, await readJsonBody(c));
      const payment = await this.useCase.execute(body);

      return c.json(PaymentMapper.toHttp(payment, []), 201);
    });
  }
}
