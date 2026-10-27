import type { Hono } from 'hono';

import { PaymentApplicationMapper } from '#src/billing/infra/mappers/payment-application.mapper.ts';
import { HttpApplyPaymentBodyDto } from '#src/billing/use-cases/apply-payment/dto.http.ts';
import type { ApplyPaymentUseCase } from '#src/billing/use-cases/apply-payment/use-case.ts';
import { parseInput, readJsonBody } from '#src/core/infra/http/validation.ts';

export class HttpApplyPaymentController {
  private readonly useCase: ApplyPaymentUseCase;

  constructor(useCase: ApplyPaymentUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.post('/payments/:paymentId/applications', async (c) => {
      const body = parseInput(HttpApplyPaymentBodyDto, await readJsonBody(c));
      const application = await this.useCase.execute({
        paymentId: c.req.param('paymentId'),
        ...body,
      });

      return c.json(PaymentApplicationMapper.toHttp(application), 201);
    });
  }
}
