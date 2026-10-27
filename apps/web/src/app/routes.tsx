import { Navigate, type RouteObject } from 'react-router';

import { DEFAULT_SPACE, spaceList, spaces } from '@/app/spaces';
import { AppShell } from '@/components/AppShell/AppShell';
import type { RouteHandle } from '@/components/AppShell/Header';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { InvoiceDrawer } from '@/features/admin/invoices/InvoiceDrawer';
import { InvoicesPage } from '@/features/admin/invoices/InvoicesPage';
import { PaymentsPage } from '@/features/admin/payments/PaymentsPage';
import { RecordPaymentDrawer } from '@/features/admin/payments/RecordPaymentDrawer';
import { ClientPage } from '@/features/broker/clients/ClientPage';
import { ClientsPage } from '@/features/broker/clients/ClientsPage';
import { ContractDrawer } from '@/features/broker/clients/ContractDrawer';
import { CompanyCrumb } from '@/features/broker/CompanyCrumb';
import { ProspectPage } from '@/features/broker/prospects/ProspectPage';
import { ProspectsPage } from '@/features/broker/prospects/ProspectsPage';
import { QuoteDrawer } from '@/features/broker/prospects/QuoteDrawer';

const handle = (
  crumb: RouteHandle['crumb'],
  icon?: RouteHandle['icon'],
): RouteHandle => ({
  crumb,
  icon,
});

const notFound: RouteObject = {
  id: 'not-found',
  path: '*',
  element: (
    <EmptyState
      title="Page not found"
      description="Check the address, or use the sidebar."
    />
  ),
};

/**
 * Every route of the app. Each space is a tree under its own prefix and `AppShell`. A
 * detail shown in a drawer is a child route of its list, rendered by the list's `<Outlet />`.
 */
export const routes: RouteObject[] = [
  { id: 'home', index: true, element: <Navigate to={DEFAULT_SPACE.homePath} replace /> },
  {
    id: 'broker',
    path: spaces.broker.basePath,
    element: <AppShell space={spaces.broker} spaces={spaceList} />,
    children: [
      {
        id: 'broker.home',
        index: true,
        element: <Navigate to={spaces.broker.homePath} replace />,
      },
      {
        path: 'prospects',
        handle: handle('Prospects', 'prospects'),
        children: [
          { id: 'broker.prospects', index: true, element: <ProspectsPage /> },
          {
            id: 'broker.prospect',
            path: ':companyId',
            element: <ProspectPage />,
            handle: handle(CompanyCrumb),
            children: [
              {
                id: 'broker.prospect.quote',
                path: 'quotes/:quoteId',
                element: <QuoteDrawer />,
              },
            ],
          },
        ],
      },
      {
        path: 'clients',
        handle: handle('Clients', 'clients'),
        children: [
          { id: 'broker.clients', index: true, element: <ClientsPage /> },
          {
            id: 'broker.client',
            path: ':companyId',
            element: <ClientPage />,
            handle: handle(CompanyCrumb),
            children: [
              {
                id: 'broker.client.contract',
                path: 'contracts/:contractId',
                element: <ContractDrawer />,
              },
            ],
          },
        ],
      },
      { ...notFound, id: 'broker.not-found' },
    ],
  },
  {
    id: 'admin',
    path: spaces.admin.basePath,
    element: <AppShell space={spaces.admin} spaces={spaceList} />,
    children: [
      {
        id: 'admin.home',
        index: true,
        element: <Navigate to={spaces.admin.homePath} replace />,
      },
      {
        id: 'admin.invoices',
        path: 'invoices',
        element: <InvoicesPage />,
        handle: handle('Invoices', 'invoices'),
        children: [
          { id: 'admin.invoice', path: ':invoiceId', element: <InvoiceDrawer /> },
        ],
      },
      {
        id: 'admin.payments',
        path: 'payments',
        element: <PaymentsPage />,
        handle: handle('Payments', 'payments'),
        children: [
          { id: 'admin.payments.new', path: 'new', element: <RecordPaymentDrawer /> },
        ],
      },
      { ...notFound, id: 'admin.not-found' },
    ],
  },
  { id: 'unknown', path: '*', element: <Navigate to={DEFAULT_SPACE.homePath} replace /> },
];
