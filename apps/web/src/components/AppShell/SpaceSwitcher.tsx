import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import type { Space } from '@/app/spaces';
import { Icon } from '@/components/Icon/Icon';
import { cx } from '@/utils/cx';

import styles from './SpaceSwitcher.module.css';

export function SpaceIcon({ space, size }: { space: Space; size: 20 | 32 }) {
  return (
    <span className={cx(styles.spaceIcon, styles[space.id], size === 20 && styles.small)}>
      <Icon name={space.icon} size={size === 20 ? 13 : 18} />
    </span>
  );
}

type SpaceSwitcherProps = {
  current: Space;
  spaces: Space[];
  /** Opens the menu on first render. */
  defaultOpen?: boolean;
};

/** The button at the top of the sidebar naming the current space, with a menu to change it. */
export function SpaceSwitcher({
  current,
  spaces,
  defaultOpen = false,
}: SpaceSwitcherProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const switchTo = (space: Space) => {
    setOpen(false);
    if (space.id !== current.id) {
      navigate(space.homePath);
    }
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={cx(styles.trigger, open && styles.expanded)}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="space-switcher"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <SpaceIcon space={current} size={32} />
        <span className={styles.names}>
          <span className={styles.name}>{current.label}</span>
          <span className={styles.product}>Harbor</span>
        </span>
        <Icon name="selector" size={16} className={styles.selector} />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <p className={styles.menuLabel}>Switch space</p>
          {spaces.map((space) => (
            <button
              key={space.id}
              type="button"
              role="menuitem"
              aria-current={space.id === current.id ? 'true' : undefined}
              className={cx(styles.item, space.id === current.id && styles.current)}
              onClick={() => switchTo(space)}
            >
              <SpaceIcon space={space} size={20} />
              <span className={styles.itemText}>
                <span>{space.label}</span>
                <span className={styles.itemDescription}>{space.description}</span>
              </span>
              {space.id === current.id && (
                <Icon name="check" size={16} className={styles.check} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
