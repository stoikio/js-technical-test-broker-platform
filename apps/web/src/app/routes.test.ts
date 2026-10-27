import { matchRoutes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routes } from '@/app/routes';
import { spaceList } from '@/app/spaces';

const leafOf = (pathname: string) => matchRoutes(routes, pathname)?.at(-1)?.route.id;
const spaceRouteOf = (pathname: string) => matchRoutes(routes, pathname)?.[0]?.route.id;

describe('routes', () => {
  it.each([
    ['/', 'home'],
    ['/broker', 'broker.home'],
    ['/broker/prospects', 'broker.prospects'],
    ['/broker/prospects/company-1', 'broker.prospect'],
    ['/broker/prospects/company-1/quotes/quote-1', 'broker.prospect.quote'],
    ['/broker/clients', 'broker.clients'],
    ['/broker/clients/company-1', 'broker.client'],
    ['/broker/clients/company-1/contracts/contract-1', 'broker.client.contract'],
    ['/admin', 'admin.home'],
    ['/admin/invoices', 'admin.invoices'],
    ['/admin/invoices/invoice-1', 'admin.invoice'],
    ['/admin/payments', 'admin.payments'],
    ['/admin/payments/new', 'admin.payments.new'],
    ['/broker/nowhere', 'broker.not-found'],
    ['/admin/nowhere', 'admin.not-found'],
    ['/nowhere', 'unknown'],
  ])('resolves %s to %s', (pathname, routeId) => {
    expect(leafOf(pathname)).toBe(routeId);
  });

  it('keeps billing pages out of the broker space and broker pages out of the admin space', () => {
    expect(spaceRouteOf('/admin/invoices/invoice-1')).toBe('admin');
    expect(spaceRouteOf('/broker/clients/company-1')).toBe('broker');
    expect(leafOf('/broker/invoices')).toBe('broker.not-found');
    expect(leafOf('/admin/prospects')).toBe('admin.not-found');
  });

  it('has a page for every sidebar link and every space home', () => {
    for (const space of spaceList) {
      const paths = [
        space.homePath,
        ...space.navigation.flatMap((section) => section.items.map((item) => item.to)),
      ];
      expect(
        paths.map(leafOf).filter((id) => /not-found|unknown|home/.test(id ?? '')),
      ).toEqual([]);
      expect(paths.map(spaceRouteOf)).toEqual(paths.map(() => space.id));
    }
  });
});
