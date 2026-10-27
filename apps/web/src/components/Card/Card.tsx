import type { ReactNode } from 'react';

import styles from './Card.module.css';

type CardProps = {
  title?: ReactNode;
  /** Muted count or hint shown after the title. */
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

/** A titled block of a page: a section heading followed by its content. */
export function Card({ title, meta, actions, children }: CardProps) {
  return (
    <section className={styles.card}>
      {(title || actions) && (
        <header className={styles.header}>
          <div className={styles.heading}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {meta && <span className={styles.meta}>{meta}</span>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
