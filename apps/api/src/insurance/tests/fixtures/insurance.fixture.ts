import { expect } from 'vitest';

import type { Company } from '#src/insurance/domain/company/company.ts';
import type { Contract } from '#src/insurance/domain/contract/contract.ts';
import type { Quote } from '#src/insurance/domain/quote/quote.ts';
import { InMemoryCompanyRepository } from '#src/insurance/infra/adapters/company-repository.in-memory.ts';
import { InMemoryContractRepository } from '#src/insurance/infra/adapters/contract-repository.in-memory.ts';
import { InMemoryQuoteRepository } from '#src/insurance/infra/adapters/quote-repository.in-memory.ts';
import { aCompany } from '#src/insurance/tests/builders/company.builder.ts';
import { aContract } from '#src/insurance/tests/builders/contract.builder.ts';
import { aQuote } from '#src/insurance/tests/builders/quote.builder.ts';
import { AcceptQuoteUseCase } from '#src/insurance/use-cases/accept-quote/use-case.ts';
import {
  type CreateCompanyCommand,
  CreateCompanyUseCase,
} from '#src/insurance/use-cases/create-company/use-case.ts';
import {
  type CreateQuoteCommand,
  CreateQuoteUseCase,
} from '#src/insurance/use-cases/create-quote/use-case.ts';
import { ListClientsUseCase } from '#src/insurance/use-cases/list-clients/use-case.ts';
import { ListProspectsUseCase } from '#src/insurance/use-cases/list-prospects/use-case.ts';
import { InMemoryEventBus } from '#src/core/infra/adapters/event-bus.in-memory.ts';
import { NoopUnitOfWork } from '#src/core/infra/adapters/unit-of-work.noop.ts';
import { BaseFixture } from '#src/core/tests/base.fixture.ts';

export class InsuranceFixture extends BaseFixture {
  private readonly companyRepository = new InMemoryCompanyRepository();
  private readonly quoteRepository = new InMemoryQuoteRepository();
  private readonly contractRepository = new InMemoryContractRepository();
  private readonly eventBus = new InMemoryEventBus();

  private readonly createCompanyUseCase = new CreateCompanyUseCase(
    this.companyRepository,
    this.clock,
    this.idGenerator,
  );
  private readonly createQuoteUseCase = new CreateQuoteUseCase(
    this.companyRepository,
    this.quoteRepository,
    this.clock,
    this.idGenerator,
  );
  private readonly acceptQuoteUseCase = new AcceptQuoteUseCase({
    quoteRepository: this.quoteRepository,
    contractRepository: this.contractRepository,
    companyRepository: this.companyRepository,
    eventBus: this.eventBus,
    unitOfWork: new NoopUnitOfWork(),
    clock: this.clock,
    idGenerator: this.idGenerator,
  });
  private readonly listProspectsUseCase = new ListProspectsUseCase(
    this.companyRepository,
    this.quoteRepository,
    this.contractRepository,
  );
  private readonly listClientsUseCase = new ListClientsUseCase(
    this.companyRepository,
    this.contractRepository,
  );

  private result: unknown = null;

  givenACompany(override: Parameters<typeof aCompany>[0] = {}) {
    const company = aCompany(override).build();
    this.companyRepository.snapshots.set(company.id, company);
    return company;
  }

  givenAQuote(override: Parameters<typeof aQuote>[0] = {}) {
    const quote = aQuote(override).build();
    this.quoteRepository.snapshots.set(quote.id, quote);
    return quote;
  }

  givenAContract(override: Parameters<typeof aContract>[0] = {}) {
    const contract = aContract(override).build();
    this.contractRepository.snapshots.set(contract.id, contract);
    return contract;
  }

  async whenACompanyIsCreated(command: CreateCompanyCommand) {
    this.result = await this.capture(() => this.createCompanyUseCase.execute(command));
  }

  async whenAQuoteIsCreated(command: CreateQuoteCommand) {
    this.result = await this.capture(() => this.createQuoteUseCase.execute(command));
  }

  async whenTheQuoteIsAccepted(quoteId: string) {
    this.result = await this.capture(() => this.acceptQuoteUseCase.execute({ quoteId }));
  }

  async whenProspectsAreListed() {
    this.result = await this.capture(() => this.listProspectsUseCase.execute());
  }

  async whenClientsAreListed() {
    this.result = await this.capture(() => this.listClientsUseCase.execute());
  }

  thenTheCompanyShouldBeSaved(expected: {
    id: string;
    name: string;
    registrationNumber: string;
  }) {
    const company = this.companyRepository.snapshots.get(expected.id);

    expect(company?.getProps()).toMatchObject({
      name: expected.name,
      registrationNumber: expected.registrationNumber,
    });
  }

  thenTheQuoteShouldBe(
    expected: { id: string } & Partial<ReturnType<Quote['getProps']>>,
  ) {
    const { id, ...props } = expected;

    expect(this.quoteRepository.snapshots.get(id)?.getProps()).toMatchObject(props);
  }

  thenTheContractShouldBe(expected: {
    id: string;
    units: number;
    unitPrice: { amount: number; currency: string };
    startOn: string;
    endOn: string;
  }) {
    const contract = this.contractRepository.snapshots.get(expected.id);
    if (!contract) {
      throw new Error(`Contract ${expected.id} was not saved`);
    }

    const { units, unitPrice, startOn, endOn } = contract.getProps();
    expect({
      id: contract.id,
      units,
      unitPrice: unitPrice.toJSON(),
      startOn: startOn.toString(),
      endOn: endOn.toString(),
    }).toEqual(expected);
  }

  thenNoContractShouldExist() {
    expect(this.contractRepository.snapshots.size).toBe(0);
  }

  thenTheEventsPublishedShouldBe(expected: { type: string; payload: object }[]) {
    expect(
      this.eventBus.published.map((event) => ({
        type: event.type,
        payload: event.payload,
      })),
    ).toEqual(expected);
  }

  thenTheProspectsShouldBe(expected: { name: string; openQuoteCount: number }[]) {
    const prospects = this.result as { company: Company; openQuoteCount: number }[];

    expect(
      prospects.map(({ company, openQuoteCount }) => ({
        name: company.name,
        openQuoteCount,
      })),
    ).toEqual(expected);
  }

  thenTheClientsShouldBe(expected: { name: string; latestContractId: string }[]) {
    const clients = this.result as { company: Company; latestContract: Contract }[];

    expect(
      clients.map(({ company, latestContract }) => ({
        name: company.name,
        latestContractId: latestContract.id,
      })),
    ).toEqual(expected);
  }
}
