import type { Hono } from 'hono';

import type { ListCompanyQuotesUseCase } from '#src/insurance/use-cases/list-company-quotes/use-case.ts';
import { QuoteMapper } from '#src/insurance/infra/mappers/quote.mapper.ts';

export class HttpListCompanyQuotesController {
  private readonly useCase: ListCompanyQuotesUseCase;

  constructor(useCase: ListCompanyQuotesUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.get('/companies/:companyId/quotes', async (c) => {
      const quotes = await this.useCase.execute({ companyId: c.req.param('companyId') });

      return c.json(quotes.map(QuoteMapper.toHttp));
    });
  }
}
