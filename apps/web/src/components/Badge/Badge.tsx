import type { ReactNode } from 'react';

import styles from './Badge.module.css';

export type BadgeTone = 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'violet';

type BadgeProps = {
  tone?: BadgeTone;
  /** Prefixes the label with a small dot in the badge's color. */
  dot?: boolean;
  children: ReactNode;
};

export function Badge({ tone = 'gray', dot = false, children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
