import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from '@/components/Icon/Icon';

import styles from './Drawer.module.css';

type DrawerProps = {
  title: ReactNode;
  /** Small line above the title naming what the drawer shows, such as "Invoice". */
  preTitle?: ReactNode;
  /** Shown next to the title, typically a status badge. */
  titleExtra?: ReactNode;
  onClose: () => void;
  /** Sticky bar at the bottom for the drawer's main action. */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Side panel showing the detail of a row over its list. Render it from a child route so the
 * detail has its own URL, and close it by navigating back to the list.
 */
export function Drawer({
  title,
  preTitle,
  titleExtra,
  onClose,
  footer,
  children,
}: DrawerProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return createPortal(
    <div className={styles.root}>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <aside className={styles.panel} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <div className={styles.topRow}>
            {preTitle && <span className={styles.preTitle}>{preTitle}</span>}
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{title}</h2>
            {titleExtra}
          </div>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
}

type DrawerSectionProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function DrawerSection({ title, actions, children }: DrawerSectionProps) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {actions}
      </header>
      {children}
    </section>
  );
}
