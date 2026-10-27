import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import styles from './QueryBoundary.module.css';

type QueryBoundaryProps<Data> = {
  query: UseQueryResult<Data>;
  children: (data: Data) => ReactNode;
};

/** Renders the loading and error states of a query, and `children` once data is there. */
export function QueryBoundary<Data>({ query, children }: QueryBoundaryProps<Data>) {
  if (query.isPending) {
    return <p className={styles.loading}>Loading...</p>;
  }

  if (query.isError) {
    return (
      <p className={styles.error}>Could not load this page: {query.error.message}</p>
    );
  }

  return <>{children(query.data)}</>;
}
