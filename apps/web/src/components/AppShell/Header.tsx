import { type ComponentType, Fragment } from 'react';
import { Link, type Params, useMatches } from 'react-router';

import { Icon, type IconName } from '@/components/Icon/Icon';

import styles from './AppShell.module.css';

/**
 * Route `handle` read by the header breadcrumb. `crumb` is a label, or a component that
 * resolves one from the route params (a company name, an invoice number).
 */
export type RouteHandle = {
  crumb?: string | ComponentType<{ params: Params }>;
  icon?: IconName;
};

const handleOf = (handle: unknown) =>
  typeof handle === 'object' && handle !== null && 'crumb' in handle
    ? (handle as RouteHandle)
    : null;

export function Header() {
  const crumbs = useMatches().flatMap((match) => {
    const handle = handleOf(match.handle);
    return handle?.crumb
      ? [{ ...handle, crumb: handle.crumb, params: match.params, to: match.pathname }]
      : [];
  });

  return (
    <header className={styles.header}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        {crumbs.map(({ crumb: Crumb, icon, params, to }, index) => {
          const label = typeof Crumb === 'string' ? Crumb : <Crumb params={params} />;
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={to}>
              {index > 0 && (
                <Icon name="chevronRight" size={14} className={styles.separator} />
              )}
              <span className={isLast ? styles.current : styles.crumb}>
                {icon && <Icon name={icon} size={18} />}
                {isLast ? label : <Link to={to}>{label}</Link>}
              </span>
            </Fragment>
          );
        })}
      </nav>
    </header>
  );
}
