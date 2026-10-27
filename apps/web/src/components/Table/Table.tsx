import type { ReactNode } from 'react';

import { cx } from '@/utils/cx';

import styles from './Table.module.css';

export type Column<Row> = {
  key: string;
  header: ReactNode;
  render: (row: Row) => ReactNode;
  align?: 'left' | 'right';
  /** Fixed column width in pixels, for short values like dates and badges. */
  width?: number;
};

type TableProps<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  getRowKey: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  /** Highlights the row shown in an open drawer. */
  selectedRowKey?: string;
  /** Rendered instead of the table when `rows` is empty. */
  empty?: ReactNode;
};

export function Table<Row>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  selectedRowKey,
  empty,
}: TableProps<Row>) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.align === 'right' ? styles.right : undefined}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = getRowKey(row);
            return (
              <tr
                key={key}
                className={cx(
                  onRowClick && styles.clickable,
                  key === selectedRowKey && styles.selected,
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.align === 'right' ? styles.right : undefined}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Primary text of a cell with an optional muted second line. */
export function CellText({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className={styles.cellText}>
      <span className={styles.primary}>{primary}</span>
      {secondary && <span className={styles.secondary}>{secondary}</span>}
    </div>
  );
}
