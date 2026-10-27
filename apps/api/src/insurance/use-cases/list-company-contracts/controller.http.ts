import type { Hono } from 'hono';

import type { ListCompanyContractsUseCase } from '#src/insurance/use-cases/list-company-contracts/use-case.ts';
import { ContractMapper } from '#src/insurance/infra/mappers/contract.mapper.ts';

export class HttpListCompanyContractsController {
  private readonly useCase: ListCompanyContractsUseCase;

  constructor(useCase: ListCompanyContractsUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.get('/companies/:companyId/contracts', async (c) => {
      const contracts = await this.useCase.execute({
        companyId: c.req.param('companyId'),
      });

      return c.json(contracts.map(ContractMapper.toHttp));
    });
  }
}
