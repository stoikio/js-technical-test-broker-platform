import type { Hono } from 'hono';

import type { ListProspectsUseCase } from '#src/insurance/use-cases/list-prospects/use-case.ts';
import { CompanyMapper } from '#src/insurance/infra/mappers/company.mapper.ts';

export class HttpListProspectsController {
  private readonly useCase: ListProspectsUseCase;

  constructor(useCase: ListProspectsUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.get('/prospects', async (c) => {
      const prospects = await this.useCase.execute();

      return c.json(
        prospects.map(({ company, openQuoteCount }) => ({
          ...CompanyMapper.toHttp(company),
          openQuoteCount,
        })),
      );
    });
  }
}
