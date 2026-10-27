import type { Hono } from 'hono';

import type { AcceptQuoteUseCase } from '#src/insurance/use-cases/accept-quote/use-case.ts';
import { ContractMapper } from '#src/insurance/infra/mappers/contract.mapper.ts';

export class HttpAcceptQuoteController {
  private readonly useCase: AcceptQuoteUseCase;

  constructor(useCase: AcceptQuoteUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.post('/quotes/:quoteId/accept', async (c) => {
      const contract = await this.useCase.execute({ quoteId: c.req.param('quoteId') });

      return c.json(ContractMapper.toHttp(contract), 201);
    });
  }
}
