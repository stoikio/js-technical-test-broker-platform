import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api/client';
import type { Client, Company, Contract, Money, Prospect, Quote } from '@/api/types';

export const companyKeys = {
  prospects: ['prospects'] as const,
  clients: ['clients'] as const,
  company: (companyId: string) => ['companies', companyId] as const,
  quotes: (companyId: string) => ['companies', companyId, 'quotes'] as const,
  contracts: (companyId: string) => ['companies', companyId, 'contracts'] as const,
};

export const useProspects = () =>
  useQuery({
    queryKey: companyKeys.prospects,
    queryFn: () => api.get<Prospect[]>('/prospects'),
  });

export const useClients = () =>
  useQuery({
    queryKey: companyKeys.clients,
    queryFn: () => api.get<Client[]>('/clients'),
  });

export const useCompany = (companyId: string) =>
  useQuery({
    queryKey: companyKeys.company(companyId),
    queryFn: () => api.get<Company>(`/companies/${companyId}`),
  });

export const useCompanyQuotes = (companyId: string) =>
  useQuery({
    queryKey: companyKeys.quotes(companyId),
    queryFn: () => api.get<Quote[]>(`/companies/${companyId}/quotes`),
  });

export const useCompanyContracts = (companyId: string) =>
  useQuery({
    queryKey: companyKeys.contracts(companyId),
    queryFn: () => api.get<Contract[]>(`/companies/${companyId}/contracts`),
  });

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { name: string; registrationNumber: string }) =>
      api.post<Company>('/companies', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.prospects }),
  });
};

export const useCreateQuote = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { units: number; unitPrice: Money }) =>
      api.post<Quote>(`/companies/${companyId}/quotes`, body),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: companyKeys.quotes(companyId) }),
        queryClient.invalidateQueries({ queryKey: companyKeys.prospects }),
      ]),
  });
};

/** Accepting a quote creates a contract and its invoice: every list may change. */
export const useAcceptQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: string) => api.post<Contract>(`/quotes/${quoteId}/accept`),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
