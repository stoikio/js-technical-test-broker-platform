import type { ReactNode } from 'react';

import styles from './PageHeader.module.css';

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons shown on the right, usually the page's main action. */
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
