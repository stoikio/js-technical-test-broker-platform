import type { ReactNode } from 'react';

import styles from './PageHeader.module.css';

type PageHeaderProps = {
  title: ReactNode;
  /** Shown next to the title, typically a status badge. */
  titleExtra?: ReactNode;
  description?: ReactNode;
  /** Buttons on the right, the page's main action last. */
  actions?: ReactNode;
};

export function PageHeader({ title, titleExtra, description, actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {titleExtra}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
