import { Fragment } from 'react';
import { Link, useMatches } from 'react-router';

import styles from './AppShell.module.css';

/** Routes opt into the breadcrumb with `handle: { crumb: 'Label' }`. */
export type RouteHandle = { crumb?: string };

const crumbOf = (handle: unknown) =>
  typeof handle === 'object' && handle !== null && 'crumb' in handle
    ? (handle as RouteHandle).crumb
    : undefined;

export function TopBar() {
  const crumbs = useMatches().flatMap((match) => {
    const crumb = crumbOf(match.handle);
    return crumb ? [{ label: crumb, to: match.pathname }] : [];
  });

  return (
    <header className={styles.topBar}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.to}>
            {index > 0 && <span className={styles.separator}>/</span>}
            {index === crumbs.length - 1 ? (
              <span className={styles.current}>{crumb.label}</span>
            ) : (
              <Link to={crumb.to}>{crumb.label}</Link>
            )}
          </Fragment>
        ))}
      </nav>
    </header>
  );
}
