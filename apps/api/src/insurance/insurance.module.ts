import { Hono } from 'hono';

import { SqliteCompanyRepository } from '#src/insurance/infra/adapters/company-repository.sqlite.ts';
import { SqliteContractRepository } from '#src/insurance/infra/adapters/contract-repository.sqlite.ts';
import { SqliteQuoteRepository } from '#src/insurance/infra/adapters/quote-repository.sqlite.ts';
import { HttpAcceptQuoteController } from '#src/insurance/use-cases/accept-quote/controller.http.ts';
import { AcceptQuoteUseCase } from '#src/insurance/use-cases/accept-quote/use-case.ts';
import { HttpCreateCompanyController } from '#src/insurance/use-cases/create-company/controller.http.ts';
import { CreateCompanyUseCase } from '#src/insurance/use-cases/create-company/use-case.ts';
import { HttpCreateQuoteController } from '#src/insurance/use-cases/create-quote/controller.http.ts';
import { CreateQuoteUseCase } from '#src/insurance/use-cases/create-quote/use-case.ts';
import { HttpGetCompanyController } from '#src/insurance/use-cases/get-company/controller.http.ts';
import { GetCompanyUseCase } from '#src/insurance/use-cases/get-company/use-case.ts';
import { HttpListClientsController } from '#src/insurance/use-cases/list-clients/controller.http.ts';
import { ListClientsUseCase } from '#src/insurance/use-cases/list-clients/use-case.ts';
import { HttpListCompanyContractsController } from '#src/insurance/use-cases/list-company-contracts/controller.http.ts';
import { ListCompanyContractsUseCase } from '#src/insurance/use-cases/list-company-contracts/use-case.ts';
import { HttpListCompanyQuotesController } from '#src/insurance/use-cases/list-company-quotes/controller.http.ts';
import { ListCompanyQuotesUseCase } from '#src/insurance/use-cases/list-company-quotes/use-case.ts';
import { HttpListProspectsController } from '#src/insurance/use-cases/list-prospects/controller.http.ts';
import { ListProspectsUseCase } from '#src/insurance/use-cases/list-prospects/use-case.ts';
import type { CoreDependencies } from '#src/core/core.module.ts';

export const createInsuranceModule = ({
  database,
  clock,
  idGenerator,
  eventBus,
  unitOfWork,
}: CoreDependencies) => {
  const companyRepository = new SqliteCompanyRepository(database);
  const quoteRepository = new SqliteQuoteRepository(database);
  const contractRepository = new SqliteContractRepository(database);

  const router = new Hono();

  new HttpCreateCompanyController(
    new CreateCompanyUseCase(companyRepository, clock, idGenerator),
  ).register(router);
  new HttpGetCompanyController(new GetCompanyUseCase(companyRepository)).register(router);
  new HttpListProspectsController(
    new ListProspectsUseCase(companyRepository, quoteRepository, contractRepository),
  ).register(router);
  new HttpListClientsController(
    new ListClientsUseCase(companyRepository, contractRepository),
  ).register(router);
  new HttpCreateQuoteController(
    new CreateQuoteUseCase(companyRepository, quoteRepository, clock, idGenerator),
  ).register(router);
  new HttpListCompanyQuotesController(
    new ListCompanyQuotesUseCase(quoteRepository),
  ).register(router);
  new HttpAcceptQuoteController(
    new AcceptQuoteUseCase({
      quoteRepository,
      contractRepository,
      companyRepository,
      eventBus,
      unitOfWork,
      clock,
      idGenerator,
    }),
  ).register(router);
  new HttpListCompanyContractsController(
    new ListCompanyContractsUseCase(contractRepository),
  ).register(router);

  return { router };
};
