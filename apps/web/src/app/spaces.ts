import type { IconName } from '@/components/Icon/Icon';

export type SpaceId = 'broker' | 'admin';

export type NavigationItem = { label: string; to: string; icon: IconName };

/** A group of sidebar links. Without `label`, the links are shown without a heading. */
export type NavigationSection = { label?: string; items: NavigationItem[] };

export type Space = {
  id: SpaceId;
  label: string;
  /** One line on who the space is for, shown in the space switcher. */
  description: string;
  icon: IconName;
  /** Every route of the space starts with it. */
  basePath: string;
  /** Where switching to the space lands. */
  homePath: string;
  navigation: NavigationSection[];
};

export const spaces: Record<SpaceId, Space> = {
  broker: {
    id: 'broker',
    label: 'Broker space',
    description: 'Prospects, quotes and clients',
    icon: 'broker',
    basePath: '/broker',
    homePath: '/broker/prospects',
    navigation: [
      {
        items: [
          { label: 'Prospects', to: '/broker/prospects', icon: 'prospects' },
          { label: 'Clients', to: '/broker/clients', icon: 'clients' },
        ],
      },
    ],
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    description: 'Invoices and payments',
    icon: 'admin',
    basePath: '/admin',
    homePath: '/admin/invoices',
    navigation: [
      {
        label: 'Billing',
        items: [
          { label: 'Invoices', to: '/admin/invoices', icon: 'invoices' },
          { label: 'Payments', to: '/admin/payments', icon: 'payments' },
        ],
      },
    ],
  },
};

export const spaceList = Object.values(spaces);

export const DEFAULT_SPACE = spaces.broker;

/** The space a URL belongs to, or null outside of every space. */
export const spaceOfPath = (pathname: string) =>
  spaceList.find(
    (space) => pathname === space.basePath || pathname.startsWith(`${space.basePath}/`),
  ) ?? null;
