import type { ReactNode } from 'react';

import styles from './StatGroup.module.css';

export type Stat = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
};

/** Key figures shown above a list, side by side. */
export function StatGroup({ stats }: { stats: Stat[] }) {
  return (
    <div className={styles.group}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.stat}>
          <span className={styles.label}>{stat.label}</span>
          <span className={styles.value}>{stat.value}</span>
          {stat.hint && <span className={styles.hint}>{stat.hint}</span>}
        </div>
      ))}
    </div>
  );
}
