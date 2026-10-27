import type { Hono } from 'hono';

import { InvoiceMapper } from '#src/billing/infra/mappers/invoice.mapper.ts';
import { HttpListInvoicesQueryDto } from '#src/billing/use-cases/list-invoices/dto.http.ts';
import type { ListInvoicesUseCase } from '#src/billing/use-cases/list-invoices/use-case.ts';
import { parseInput } from '#src/core/infra/http/validation.ts';

export class HttpListInvoicesController {
  private readonly useCase: ListInvoicesUseCase;

  constructor(useCase: ListInvoicesUseCase) {
    this.useCase = useCase;
  }

  register(router: Hono) {
    router.get('/invoices', async (c) => {
      const query = parseInput(HttpListInvoicesQueryDto, c.req.query());
      const balances = await this.useCase.execute(query);

      return c.json(balances.map(InvoiceMapper.toHttp));
    });
  }
}
