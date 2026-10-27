import { describe, expect, it } from 'vitest';

import { DEFAULT_SPACE, spaceList, spaceOfPath, spaces } from '@/app/spaces';

describe('spaces', () => {
  it('finds the space of a URL from its prefix', () => {
    expect(spaceOfPath('/broker/prospects/company-1')?.id).toBe('broker');
    expect(spaceOfPath('/admin')?.id).toBe('admin');
    expect(spaceOfPath('/administration')).toBeNull();
    expect(spaceOfPath('/')).toBeNull();
  });

  it('keeps every link of a space under its prefix', () => {
    for (const space of spaceList) {
      const links = space.navigation.flatMap((section) =>
        section.items.map((item) => item.to),
      );
      expect(
        [space.homePath, ...links].every((to) => spaceOfPath(to)?.id === space.id),
      ).toBe(true);
    }
  });

  it('opens the broker space by default', () => {
    expect(DEFAULT_SPACE).toBe(spaces.broker);
  });
});
