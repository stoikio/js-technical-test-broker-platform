import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { spaceList, spaces } from '@/app/spaces';
import { SpaceSwitcher } from '@/components/AppShell/SpaceSwitcher';

const render = (props: Parameters<typeof SpaceSwitcher>[0]) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <SpaceSwitcher {...props} />
    </MemoryRouter>,
  );

describe('SpaceSwitcher', () => {
  it('names the current space and stays closed', () => {
    const html = render({ current: spaces.admin, spaces: spaceList });

    expect(html).toContain('>Admin<');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="menu"');
  });

  it('lists every space and marks the current one when open', () => {
    const html = render({ current: spaces.broker, spaces: spaceList, defaultOpen: true });
    const items = html.match(/role="menuitem"/g) ?? [];

    expect(items).toHaveLength(spaceList.length);
    expect(html).toContain('Broker space');
    expect(html).toContain('Invoices and payments');
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-current="true"[^>]*>.*?Broker space/);
  });
});
