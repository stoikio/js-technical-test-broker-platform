import { createBrowserRouter, Navigate } from 'react-router';

import { navigation } from '@/app/navigation';
import { AppShell } from '@/components/AppShell/AppShell';
import type { RouteHandle } from '@/components/AppShell/TopBar';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { InvoicePage } from '@/features/admin/InvoicePage';
import { InvoicesPage } from '@/features/admin/InvoicesPage';
import { PaymentsPage } from '@/features/admin/PaymentsPage';
import { ClientPage } from '@/features/clients/ClientPage';
import { ClientsPage } from '@/features/clients/ClientsPage';
import { ProspectPage } from '@/features/prospects/ProspectPage';
import { ProspectsPage } from '@/features/prospects/ProspectsPage';

const crumb = (label: string): RouteHandle => ({ crumb: label });

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell navigation={navigation} />,
    children: [
      { index: true, element: <Navigate to="/prospects" replace /> },
      {
        path: 'prospects',
        handle: crumb('Prospects'),
        children: [
          { index: true, element: <ProspectsPage /> },
          { path: ':companyId', element: <ProspectPage />, handle: crumb('Prospect') },
        ],
      },
      {
        path: 'clients',
        handle: crumb('Clients'),
        children: [
          { index: true, element: <ClientsPage /> },
          { path: ':companyId', element: <ClientPage />, handle: crumb('Client') },
        ],
      },
      {
        path: 'admin',
        handle: crumb('Admin'),
        children: [
          { index: true, element: <Navigate to="/admin/invoices" replace /> },
          {
            path: 'invoices',
            handle: crumb('Invoices'),
            children: [
              { index: true, element: <InvoicesPage /> },
              { path: ':invoiceId', element: <InvoicePage />, handle: crumb('Invoice') },
            ],
          },
          { path: 'payments', element: <PaymentsPage />, handle: crumb('Payments') },
        ],
      },
      { path: '*', element: <EmptyState title="Page not found" /> },
    ],
  },
]);
