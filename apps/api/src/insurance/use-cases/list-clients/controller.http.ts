import type { Hono } from 'hono';

import type { ListClientsUseCase } from '#src/insurance/use-cases/list-clients/use-case.ts';
import { CompanyMapper } from '#src/insurance/infra/mappers/company.mapper.ts';
import { ContractMapper } from '#src/insurance/infra/mappers/contract.mapper.ts';

export class HttpListClientsController {
  private readonly useCase: ListClientsUseCase;

  constructor(useCase: ListClientsUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.get('/clients', async (c) => {
      const clients = await this.useCase.execute();

      return c.json(
        clients.map(({ company, latestContract, contractCount }) => ({
          ...CompanyMapper.toHttp(company),
          latestContract: ContractMapper.toHttp(latestContract),
          contractCount,
        })),
      );
    });
  }
}
