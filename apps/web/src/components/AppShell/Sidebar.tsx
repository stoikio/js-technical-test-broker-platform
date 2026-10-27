import { NavLink } from 'react-router';

import type { Space } from '@/app/spaces';
import { Icon } from '@/components/Icon/Icon';
import { cx } from '@/utils/cx';

import styles from './AppShell.module.css';
import { SpaceSwitcher } from './SpaceSwitcher';

export function Sidebar({ space, spaces }: { space: Space; spaces: Space[] }) {
  return (
    <nav className={styles.sidebar} aria-label={`${space.label} navigation`}>
      <div className={styles.switcher}>
        <SpaceSwitcher current={space} spaces={spaces} />
      </div>
      <div className={styles.nav}>
        {space.navigation.map((section, index) => (
          <div key={section.label ?? index} className={styles.section}>
            {section.label && <p className={styles.sectionLabel}>{section.label}</p>}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cx(styles.link, isActive && styles.active)}
              >
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.brand}>
        <span className={styles.logo}>H</span>
        Harbor
      </div>
    </nav>
  );
}
