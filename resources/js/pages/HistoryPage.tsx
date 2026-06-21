import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { styles, colors } from '../lib/styles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditRow {
  item_id: number;
  item_name: string;
  full_name: string | null;
  category: string;
  unit: string | null;
  par_level: number | null;
  qty_restaurant: number | null;
  qty_office: number | null;
  qty_total: number | null;
  is_low_stock: boolean | null;
  status: 'entered' | 'missing';
  entered_by: string | null;
  entered_at: string | null;
}

interface AuditMeta {
  date: string;
  total_items: number;
  entered_count: number;
  missing_count: number;
  completion_pct: number;
}

interface AuditResponse {
  data: AuditRow[];
  meta: AuditMeta;
}

interface HistoryRow {
  entry_date: string;
  qty_restaurant: number;
  qty_office: number;
  qty_total: number;
  entered_by: string | null;
  entered_at: string | null;
}

interface User {
  id: number;
  name: string;
  role: string;
}

// ─── Item Trend Modal ──────────────────────────────────────────────────────────

function TrendModal({ item, onClose }: { item: AuditRow; onClose: () => void }) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['history', item.item_id],
    queryFn: async () => (await api.get('/inventory/history', { params: { item_id: item.item_id, days: 30 } })).data.data as HistoryRow[],
  });

  return (
    <div
      style={styles.modalOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ ...styles.modalContent, maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary }}>
              📈 {item.item_name}
            </h2>
            <p style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '4px' }}>
              Last 30 days · Must have: <span style={{ color: colors.accent, fontWeight: '600' }}>{item.par_level ?? '—'}</span> {item.unit}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '20px', padding: '0 4px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: colors.textSecondary }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>📭</p>
            <p>No entries in the last 30 days.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  {['Date', 'Restaurant', 'Office', 'Total', 'Status', 'By', 'Time'].map((h, i) => (
                    <th key={h} style={{ ...styles.tableHeaderCell, textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  const isLow = item.par_level !== null && row.qty_total < item.par_level;
                  return (
                    <tr
                      key={row.entry_date}
                      style={styles.tableRow}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={styles.tableCell}>{row.entry_date}</td>
                      <td style={{ ...styles.tableCell, textAlign: 'center', fontFamily: '"DM Mono", monospace' }}>{row.qty_restaurant}</td>
                      <td style={{ ...styles.tableCell, textAlign: 'center', fontFamily: '"DM Mono", monospace' }}>{row.qty_office}</td>
                      <td style={{ ...styles.tableCell, textAlign: 'center', fontFamily: '"DM Mono", monospace', color: isLow ? colors.red : colors.textPrimary, fontWeight: isLow ? '700' : 'normal' }}>
                        {row.qty_total}
                      </td>
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                        <StatusBadge variant={isLow ? 'low-stock' : 'active'}>{isLow ? 'Low' : 'OK'}</StatusBadge>
                      </td>
                      <td style={{ ...styles.tableCell, textAlign: 'center', color: colors.textSecondary, fontSize: '13px' }}>{row.entered_by ?? '—'}</td>
                      <td style={{ ...styles.tableCell, textAlign: 'center', color: colors.textSecondary, fontSize: '13px', fontFamily: '"DM Mono", monospace' }}>{row.entered_at ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function HistoryPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [userId, setUserId] = useState('');
  const [selectedItem, setSelectedItem] = useState<AuditRow | null>(null);

  useEffect(() => {
    console.log('[HistoryPage] MOUNTED');
    return () => console.log('[HistoryPage] UNMOUNTED');
  }, []);

  const { data: audit, isLoading, error: auditError } = useQuery({
    queryKey: ['audit', date, userId],
    queryFn: async () => {
      console.log('[HistoryPage] fetching /inventory/audit...');
      const params: Record<string, string> = { date };
      if (userId) params.user_id = userId;
      const res = await api.get('/inventory/audit', { params });
      console.log('[HistoryPage] /inventory/audit response:', res.data);
      return res.data as AuditResponse;
    },
  });

  const { data: users = [], error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('[HistoryPage] fetching /users...');
      const res = await api.get('/users');
      console.log('[HistoryPage] /users response ok, count:', res.data.data?.length);
      return res.data.data as User[];
    },
  });

  if (auditError) console.error('[HistoryPage] auditError:', auditError);
  if (usersError) console.error('[HistoryPage] usersError:', usersError);

  const meta = audit?.meta;
  const rows = audit?.data ?? [];

  return (
    <Layout title="Inventory History">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Filters */}
        <div style={{ ...styles.card, display: 'flex', flexWrap: 'wrap' as const, gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 160px' }}>
            <p style={styles.formLabel}>Date</p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...styles.input, width: '100%' }}
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <p style={styles.formLabel}>Filter by Employee</p>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{ ...styles.input, width: '100%', cursor: 'pointer' }}
            >
              <option value="">All employees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {meta && (
            <div style={{ flex: '2 1 260px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={styles.formLabel}>Completion</p>
                <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: '"DM Mono", monospace', color: meta.completion_pct === 100 ? colors.green : colors.accent }}>
                  {meta.entered_count} / {meta.total_items} ({meta.completion_pct}%)
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: colors.bgInput, borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  backgroundColor: meta.completion_pct === 100 ? colors.green : colors.accent,
                  width: `${meta.completion_pct}%`,
                  transition: 'width 0.4s ease',
                  borderRadius: '9999px',
                }} />
              </div>
              {meta.missing_count > 0 && (
                <p style={{ fontSize: '12px', color: colors.red, marginTop: '6px' }}>
                  ⚠️ {meta.missing_count} item{meta.missing_count !== 1 ? 's' : ''} not entered yet
                </p>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <LoadingSpinner />
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: colors.textSecondary }}>
            <p style={{ fontSize: '40px', marginBottom: '16px' }}>📭</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary }}>No active items found</p>
          </div>
        ) : (
          <div style={styles.card}>
            <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '12px' }}>
              Click any row to see the 30-day trend for that item.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    {['Item', 'Category', 'Restaurant', 'Office', 'Total', 'Status', 'Entered By', 'Time'].map((h, i) => (
                      <th
                        key={h}
                        style={{ ...styles.tableHeaderCell, textAlign: i < 2 ? 'left' : 'center' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isMissing = row.status === 'missing';
                    const isLow = row.is_low_stock === true;

                    return (
                      <tr
                        key={row.item_id}
                        onClick={() => setSelectedItem(row)}
                        style={{
                          ...styles.tableRow,
                          cursor: 'pointer',
                          opacity: isMissing ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={styles.tableCell}>
                          <p style={{ fontWeight: '600', color: colors.textPrimary }}>{row.item_name}</p>
                          {row.full_name && (
                            <p style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '2px' }}>{row.full_name}</p>
                          )}
                        </td>
                        <td style={{ ...styles.tableCell, color: colors.textSecondary, fontSize: '13px' }}>{row.category}</td>

                        {/* Quantities */}
                        <td style={{ ...styles.tableCell, textAlign: 'center', fontFamily: '"DM Mono", monospace' }}>
                          {isMissing ? <span style={{ color: colors.textTertiary }}>—</span> : row.qty_restaurant}
                        </td>
                        <td style={{ ...styles.tableCell, textAlign: 'center', fontFamily: '"DM Mono", monospace' }}>
                          {isMissing ? <span style={{ color: colors.textTertiary }}>—</span> : row.qty_office}
                        </td>
                        <td style={{ ...styles.tableCell, textAlign: 'center', fontFamily: '"DM Mono", monospace', fontWeight: isLow ? '700' : 'normal', color: isLow ? colors.red : colors.textPrimary }}>
                          {isMissing ? <span style={{ color: colors.textTertiary }}>—</span> : row.qty_total}
                        </td>

                        {/* Status badge */}
                        <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                          {isMissing
                            ? <StatusBadge variant="inactive">Not entered</StatusBadge>
                            : <StatusBadge variant={isLow ? 'low-stock' : 'active'}>{isLow ? 'Low' : 'OK'}</StatusBadge>
                          }
                        </td>

                        {/* Who + when */}
                        <td style={{ ...styles.tableCell, textAlign: 'center', color: colors.textSecondary, fontSize: '13px' }}>
                          {row.entered_by ?? <span style={{ color: colors.textTertiary }}>—</span>}
                        </td>
                        <td style={{ ...styles.tableCell, textAlign: 'center', color: colors.textSecondary, fontSize: '13px', fontFamily: '"DM Mono", monospace' }}>
                          {row.entered_at ?? <span style={{ color: colors.textTertiary }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Item trend modal */}
      {selectedItem && (
        <TrendModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </Layout>
  );
}
