import { Outlet } from 'react-router';

import type { NavigationSection } from '@/app/navigation';

import styles from './AppShell.module.css';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell({ navigation }: { navigation: NavigationSection[] }) {
  return (
    <div className={styles.shell}>
      <Sidebar navigation={navigation} />
      <div className={styles.main}>
        <TopBar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
