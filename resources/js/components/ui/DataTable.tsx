import { colors, styles } from '../../lib/styles';
import { LoadingSpinner } from './LoadingSpinner';

export interface Column<T> {
  header: string;
  align?: 'left' | 'center' | 'right';
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, keyExtractor, isLoading, emptyMessage }: DataTableProps<T>) {
  if (isLoading) return <LoadingSpinner />;

  return (
    <div style={styles.card}>
      <div style={{ overflowX: 'auto' as const }}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  style={{
                    ...styles.tableHeaderCell,
                    textAlign: (col.align ?? 'left') as 'left' | 'center' | 'right',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    ...styles.tableCell,
                    textAlign: 'center',
                    padding: '48px',
                    color: colors.textSecondary,
                  }}
                >
                  {emptyMessage ?? 'No records found.'}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  style={styles.tableRow}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      style={{
                        ...styles.tableCell,
                        textAlign: (col.align ?? 'left') as 'left' | 'center' | 'right',
                      }}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
