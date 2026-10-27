import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/Icon/Icon';
import { cx } from '@/utils/cx';

import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** `primary` for the main action of a view, `default` for the others, `subtle` inside tables. */
  variant?: 'primary' | 'default' | 'subtle';
  size?: 'xs' | 'sm';
  leftIcon?: IconName;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'sm',
  type = 'button',
  leftIcon,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(styles.button, styles[variant], styles[size], className)}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        leftIcon && <Icon name={leftIcon} size={size === 'xs' ? 14 : 16} />
      )}
      {children}
    </button>
  );
}
