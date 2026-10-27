import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/Icon/Icon';

import styles from './EmptyState.module.css';

type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  icon = 'inbox',
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>
        <Icon name={icon} size={18} />
      </div>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
