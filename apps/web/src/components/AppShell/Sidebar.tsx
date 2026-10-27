import { NavLink } from 'react-router';

import type { NavigationSection } from '@/app/navigation';
import { Icon } from '@/components/Icon/Icon';

import styles from './AppShell.module.css';

export function Sidebar({ navigation }: { navigation: NavigationSection[] }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo}>H</span>
        <span className={styles.brandName}>Harbor</span>
      </div>
      <nav className={styles.nav}>
        {navigation.map((section) => (
          <div key={section.label} className={styles.section}>
            <p className={styles.sectionLabel}>{section.label}</p>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
