import { expect } from 'vitest';

import type { InvoicePaymentState } from '#src/billing/domain/invoice/invoice-balance.ts';
import { InMemoryInvoiceRepository } from '#src/billing/infra/adapters/invoice-repository.in-memory.ts';
import { InMemoryPaymentApplicationRepository } from '#src/billing/infra/adapters/payment-application-repository.in-memory.ts';
import { InMemoryPaymentRepository } from '#src/billing/infra/adapters/payment-repository.in-memory.ts';
import { anInvoice } from '#src/billing/tests/builders/invoice.builder.ts';
import {
  aPayment,
  aPaymentApplication,
} from '#src/billing/tests/builders/payment.builder.ts';
import {
  type ApplyPaymentCommand,
  ApplyPaymentUseCase,
} from '#src/billing/use-cases/apply-payment/use-case.ts';
import {
  type IssueInvoiceCommand,
  IssueInvoiceUseCase,
} from '#src/billing/use-cases/issue-invoice/use-case.ts';
import { ListInvoicesUseCase } from '#src/billing/use-cases/list-invoices/use-case.ts';
import {
  type RecordPaymentCommand,
  RecordPaymentUseCase,
} from '#src/billing/use-cases/record-payment/use-case.ts';
import { NoopUnitOfWork } from '#src/core/infra/adapters/unit-of-work.noop.ts';
import { BaseFixture } from '#src/core/tests/base.fixture.ts';

export class BillingFixture extends BaseFixture {
  private readonly invoiceRepository = new InMemoryInvoiceRepository();
  private readonly paymentRepository = new InMemoryPaymentRepository();
  private readonly paymentApplicationRepository =
    new InMemoryPaymentApplicationRepository();

  private readonly issueInvoiceUseCase = new IssueInvoiceUseCase(
    this.invoiceRepository,
    this.clock,
    this.idGenerator,
  );
  private readonly recordPaymentUseCase = new RecordPaymentUseCase(
    this.paymentRepository,
    this.clock,
    this.idGenerator,
  );
  private readonly applyPaymentUseCase = new ApplyPaymentUseCase({
    paymentRepository: this.paymentRepository,
    invoiceRepository: this.invoiceRepository,
    paymentApplicationRepository: this.paymentApplicationRepository,
    unitOfWork: new NoopUnitOfWork(),
    clock: this.clock,
    idGenerator: this.idGenerator,
  });
  private readonly listInvoicesUseCase = new ListInvoicesUseCase(
    this.invoiceRepository,
    this.paymentApplicationRepository,
  );

  givenAnInvoice(override: Parameters<typeof anInvoice>[0] = {}) {
    const invoice = anInvoice(override).build();
    this.invoiceRepository.snapshots.set(invoice.id, invoice);
    return invoice;
  }

  givenAPayment(override: Parameters<typeof aPayment>[0] = {}) {
    const payment = aPayment(override).build();
    this.paymentRepository.snapshots.set(payment.id, payment);
    return payment;
  }

  givenAPaymentApplication(override: Parameters<typeof aPaymentApplication>[0] = {}) {
    const application = aPaymentApplication(override).build();
    this.paymentApplicationRepository.snapshots.set(application.id, application);
    return application;
  }

  async whenAnInvoiceIsIssued(command: IssueInvoiceCommand) {
    await this.capture(() => this.issueInvoiceUseCase.execute(command));
  }

  async whenAPaymentIsRecorded(command: RecordPaymentCommand) {
    await this.capture(() => this.recordPaymentUseCase.execute(command));
  }

  async whenThePaymentIsApplied(command: ApplyPaymentCommand) {
    await this.capture(() => this.applyPaymentUseCase.execute(command));
  }

  thenTheInvoicesShouldBe(
    expected: {
      id?: string;
      number: string;
      amount: number;
      issuedOn: string;
      dueOn: string;
      billedTo?: string;
    }[],
  ) {
    expect(
      [...this.invoiceRepository.snapshots.values()].map((invoice) => {
        const { number, amount, issuedOn, dueOn, billedTo } = invoice.getProps();
        return {
          id: invoice.id,
          number,
          amount: amount.amount,
          issuedOn: issuedOn.toString(),
          dueOn: dueOn.toString(),
          billedTo,
        };
      }),
    ).toMatchObject(expected);
  }

  thenThePaymentShouldBeRecorded(expected: {
    id: string;
    amount: number;
    receivedOn: string;
  }) {
    const payment = this.paymentRepository.snapshots.get(expected.id);
    const props = payment?.getProps();

    expect({
      id: payment?.id,
      amount: props?.amount.amount,
      receivedOn: props?.receivedOn.toString(),
    }).toEqual(expected);
  }

  thenNoPaymentShouldBeRecorded() {
    expect(this.paymentRepository.snapshots.size).toBe(0);
  }

  async thenTheInvoiceBalanceShouldBe(
    invoiceId: string,
    expected: {
      paidAmount: number;
      outstandingAmount: number;
      paymentState: InvoicePaymentState;
    },
  ) {
    const balance = (await this.listInvoicesUseCase.execute()).find(
      (entry) => entry.invoice.id === invoiceId,
    );

    expect({
      paidAmount: balance?.paidAmount.amount,
      outstandingAmount: balance?.outstandingAmount.amount,
      paymentState: balance?.paymentState,
    }).toEqual(expected);
  }

  thenTheApplicationCountShouldBe(count: number) {
    expect(this.paymentApplicationRepository.snapshots.size).toBe(count);
  }
}
