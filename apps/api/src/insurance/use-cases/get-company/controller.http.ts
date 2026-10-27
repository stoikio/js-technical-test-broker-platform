import type { Hono } from 'hono';

import type { GetCompanyUseCase } from '#src/insurance/use-cases/get-company/use-case.ts';
import { CompanyMapper } from '#src/insurance/infra/mappers/company.mapper.ts';

export class HttpGetCompanyController {
  private readonly useCase: GetCompanyUseCase;

  constructor(useCase: GetCompanyUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.get('/companies/:companyId', async (c) => {
      const company = await this.useCase.execute({ companyId: c.req.param('companyId') });

      return c.json(CompanyMapper.toHttp(company));
    });
  }
}
