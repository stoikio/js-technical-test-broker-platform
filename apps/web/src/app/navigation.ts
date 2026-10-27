import type { IconName } from '@/components/Icon/Icon';

export type NavigationItem = { label: string; to: string; icon: IconName };
export type NavigationSection = { label: string; items: NavigationItem[] };

export const navigation: NavigationSection[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Prospects', to: '/prospects', icon: 'prospects' },
      { label: 'Clients', to: '/clients', icon: 'clients' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Invoices', to: '/admin/invoices', icon: 'invoices' },
      { label: 'Payments', to: '/admin/payments', icon: 'payments' },
    ],
  },
];
