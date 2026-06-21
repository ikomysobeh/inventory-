import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { styles, colors } from '../lib/styles';

interface LowStockItem {
  item_id: number;
  name: string;
  unit: string;
  par_level: number;
  qty_restaurant: number;
  qty_office: number;
  qty_total: number;
  qty_needed: number;
  category: { name: string };
  supplier: { name: string } | null;
}

const monoCell = { fontFamily: '"DM Mono", monospace' } as const;

export function DashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data.data,
    staleTime: 2 * 60 * 1000,  // treat data as fresh for 2 min — no refetch on tab focus
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => (await api.get('/dashboard/low-stock')).data.data as LowStockItem[],
    staleTime: 2 * 60 * 1000,
  });

  return (
    <Layout title="Dashboard">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Greeting */}
          <div>
            <h1 style={styles.pageTitle}>Good morning! 👋</h1>
            <p style={{ fontSize: '14px', color: colors.textSecondary }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={styles.cardLabel}>Total Items</p>
                  <p style={styles.cardValue}>{dashboard?.total_items ?? 0}</p>
                </div>
                <span style={{ fontSize: '20px' }}>📦</span>
              </div>
            </div>

            <div style={styles.cardWithLeftBorder(colors.red)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={styles.cardLabel}>Low Stock</p>
                  <p style={styles.cardValueRed}>{dashboard?.low_stock_count ?? 0}</p>
                </div>
                <span style={{ fontSize: '20px' }}>🔴</span>
              </div>
            </div>

            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={styles.cardLabel}>Last Count</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: colors.accent, marginTop: '8px' }}>
                    {dashboard?.last_entry_date ?? '—'}
                  </p>
                </div>
                <span style={{ fontSize: '20px' }}>📅</span>
              </div>
            </div>
          </div>

          {/* Low Stock Table */}
          {lowStockItems && lowStockItems.length > 0 && (
            <div style={styles.card}>
              <h2 style={{ ...styles.pageTitle, fontSize: '18px', marginBottom: '16px' }}>Low Stock Alerts 🔴</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      {['Item', 'Rest', 'Office', 'Must Have', 'Need', 'Unit'].map((h, i) => (
                        <th key={h} style={{ ...styles.tableHeaderCell, textAlign: i > 0 ? 'center' : 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr
                        key={item.item_id}
                        style={styles.tableRow}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={styles.tableCell}>{item.name}</td>
                        <td style={{ ...styles.tableCell, textAlign: 'center', ...monoCell }}>{item.qty_restaurant}</td>
                        <td style={{ ...styles.tableCell, textAlign: 'center', ...monoCell }}>{item.qty_office}</td>
                        <td style={{ ...styles.tableCell, textAlign: 'center', ...monoCell }}>{item.par_level}</td>
                        <td style={{ ...styles.tableCell, textAlign: 'center', ...monoCell, color: colors.red, fontWeight: 'bold' }}>{item.qty_needed}</td>
                        <td style={{ ...styles.tableCell, textAlign: 'center' }}>{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div style={styles.card}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, marginBottom: '16px' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {[
                { to: '/inventory', label: '📋 Count Inventory' },
                { to: '/items',     label: '📦 Manage Items' },
                { to: '/categories',label: '🏷️ Categories' },
                { to: '/suppliers', label: '🚚 Suppliers' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: colors.bgInput,
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: colors.textPrimary,
                    fontWeight: '600',
                    transition: 'all 0.15s',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgHover; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.bgInput; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <span>{label}</span>
                  <span style={{ color: colors.accent }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
