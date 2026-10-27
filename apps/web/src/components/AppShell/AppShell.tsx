import { Outlet } from 'react-router';

import type { Space } from '@/app/spaces';

import styles from './AppShell.module.css';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/** Layout of a space: its sidebar, and the page in a raised panel under the breadcrumb header. */
export function AppShell({ space, spaces }: { space: Space; spaces: Space[] }) {
  return (
    <div className={styles.shell} data-space={space.id}>
      <Sidebar space={space} spaces={spaces} />
      <div className={styles.mainColumn}>
        <main className={styles.main}>
          <Header />
          <div className={styles.scroll}>
            <div className={styles.page}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
