import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api/client';
import type {
  Invoice,
  InvoiceDetail,
  Money,
  Payment,
  PaymentApplication,
} from '@/api/types';

export const billingKeys = {
  invoices: (filter: { companyId?: string } = {}) => ['invoices', filter] as const,
  invoice: (invoiceId: string) => ['invoice', invoiceId] as const,
  payments: ['payments'] as const,
};

export const useInvoices = (filter: { companyId?: string } = {}) =>
  useQuery({
    queryKey: billingKeys.invoices(filter),
    queryFn: () =>
      api.get<Invoice[]>(
        filter.companyId
          ? `/invoices?companyId=${encodeURIComponent(filter.companyId)}`
          : '/invoices',
      ),
  });

export const useInvoice = (invoiceId: string) =>
  useQuery({
    queryKey: billingKeys.invoice(invoiceId),
    queryFn: () => api.get<InvoiceDetail>(`/invoices/${invoiceId}`),
  });

export const usePayments = () =>
  useQuery({
    queryKey: billingKeys.payments,
    queryFn: () => api.get<Payment[]>('/payments'),
  });

export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { amount: Money; receivedOn: string }) =>
      api.post<Payment>('/payments', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: billingKeys.payments }),
  });
};

export const useApplyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      ...body
    }: {
      paymentId: string;
      invoiceId: string;
      amount: number;
    }) => api.post<PaymentApplication>(`/payments/${paymentId}/applications`, body),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['invoice'] }),
        queryClient.invalidateQueries({ queryKey: billingKeys.payments }),
      ]),
  });
};
