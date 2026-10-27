import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { Icon } from '@/components/Icon/Icon';

import styles from './QueryBoundary.module.css';

type QueryBoundaryProps<Data> = {
  query: UseQueryResult<Data>;
  children: (data: Data) => ReactNode;
};

/** Renders the loading and error states of a query, and `children` once data is there. */
export function QueryBoundary<Data>({ query, children }: QueryBoundaryProps<Data>) {
  if (query.isPending) {
    return (
      <div className={styles.loading} aria-busy="true" aria-label="Loading">
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </div>
    );
  }

  if (query.isError) {
    return (
      <p className={styles.error} role="alert">
        <Icon name="alert" size={18} />
        Could not load this content: {query.error.message}
      </p>
    );
  }

  return <>{children(query.data)}</>;
}
