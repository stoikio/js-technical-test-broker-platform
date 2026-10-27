import { Hono } from 'hono';

import { SqliteInvoiceRepository } from '#src/billing/infra/adapters/invoice-repository.sqlite.ts';
import { SqlitePaymentApplicationRepository } from '#src/billing/infra/adapters/payment-application-repository.sqlite.ts';
import { SqlitePaymentRepository } from '#src/billing/infra/adapters/payment-repository.sqlite.ts';
import { HttpApplyPaymentController } from '#src/billing/use-cases/apply-payment/controller.http.ts';
import { ApplyPaymentUseCase } from '#src/billing/use-cases/apply-payment/use-case.ts';
import { HttpGetInvoiceController } from '#src/billing/use-cases/get-invoice/controller.http.ts';
import { GetInvoiceUseCase } from '#src/billing/use-cases/get-invoice/use-case.ts';
import { EventIssueInvoiceController } from '#src/billing/use-cases/issue-invoice/controller.event.ts';
import { IssueInvoiceUseCase } from '#src/billing/use-cases/issue-invoice/use-case.ts';
import { HttpListInvoicesController } from '#src/billing/use-cases/list-invoices/controller.http.ts';
import { ListInvoicesUseCase } from '#src/billing/use-cases/list-invoices/use-case.ts';
import { HttpListPaymentsController } from '#src/billing/use-cases/list-payments/controller.http.ts';
import { ListPaymentsUseCase } from '#src/billing/use-cases/list-payments/use-case.ts';
import { HttpRecordPaymentController } from '#src/billing/use-cases/record-payment/controller.http.ts';
import { RecordPaymentUseCase } from '#src/billing/use-cases/record-payment/use-case.ts';
import type { CoreDependencies } from '#src/core/core.module.ts';

export const createBillingModule = ({
  database,
  clock,
  idGenerator,
  eventBus,
  unitOfWork,
}: CoreDependencies) => {
  const invoiceRepository = new SqliteInvoiceRepository(database);
  const paymentRepository = new SqlitePaymentRepository(database);
  const paymentApplicationRepository = new SqlitePaymentApplicationRepository(database);

  new EventIssueInvoiceController(
    new IssueInvoiceUseCase(invoiceRepository, clock, idGenerator),
  ).register(eventBus);

  const router = new Hono();

  new HttpListInvoicesController(
    new ListInvoicesUseCase(invoiceRepository, paymentApplicationRepository),
  ).register(router);
  new HttpGetInvoiceController(
    new GetInvoiceUseCase(
      invoiceRepository,
      paymentRepository,
      paymentApplicationRepository,
    ),
  ).register(router);
  new HttpRecordPaymentController(
    new RecordPaymentUseCase(paymentRepository, clock, idGenerator),
  ).register(router);
  new HttpListPaymentsController(
    new ListPaymentsUseCase(paymentRepository, paymentApplicationRepository),
  ).register(router);
  new HttpApplyPaymentController(
    new ApplyPaymentUseCase({
      paymentRepository,
      invoiceRepository,
      paymentApplicationRepository,
      unitOfWork,
      clock,
      idGenerator,
    }),
  ).register(router);

  return { router };
};
