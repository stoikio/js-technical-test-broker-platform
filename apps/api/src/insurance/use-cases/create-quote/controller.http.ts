import type { Hono } from 'hono';

import { HttpCreateQuoteBodyDto } from '#src/insurance/use-cases/create-quote/dto.http.ts';
import type { CreateQuoteUseCase } from '#src/insurance/use-cases/create-quote/use-case.ts';
import { QuoteMapper } from '#src/insurance/infra/mappers/quote.mapper.ts';
import { parseInput, readJsonBody } from '#src/core/infra/http/validation.ts';

export class HttpCreateQuoteController {
  private readonly useCase: CreateQuoteUseCase;

  constructor(useCase: CreateQuoteUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.post('/companies/:companyId/quotes', async (c) => {
      const body = parseInput(HttpCreateQuoteBodyDto, await readJsonBody(c));
      const quote = await this.useCase.execute({
        companyId: c.req.param('companyId'),
        ...body,
      });

      return c.json(QuoteMapper.toHttp(quote), 201);
    });
  }
}
