import type { ReactNode } from 'react';

import { cx } from '@/utils/cx';

import styles from './DescriptionList.module.css';

type DescriptionListProps = {
  items: { label: string; value: ReactNode }[];
  /** `grid` lays fields out in columns on a page, `rows` stacks label and value side by side in a drawer. */
  layout?: 'grid' | 'rows';
};

export function DescriptionList({ items, layout = 'grid' }: DescriptionListProps) {
  return (
    <dl className={cx(styles.list, styles[layout])}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
