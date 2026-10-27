import type { Hono } from 'hono';

import { HttpCreateCompanyBodyDto } from '#src/insurance/use-cases/create-company/dto.http.ts';
import type { CreateCompanyUseCase } from '#src/insurance/use-cases/create-company/use-case.ts';
import { CompanyMapper } from '#src/insurance/infra/mappers/company.mapper.ts';
import { parseInput, readJsonBody } from '#src/core/infra/http/validation.ts';

export class HttpCreateCompanyController {
  private readonly useCase: CreateCompanyUseCase;

  constructor(useCase: CreateCompanyUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.post('/companies', async (c) => {
      const body = parseInput(HttpCreateCompanyBodyDto, await readJsonBody(c));
      const company = await this.useCase.execute(body);

      return c.json(CompanyMapper.toHttp(company), 201);
    });
  }
}
