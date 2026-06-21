import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Leaf, Milk, Beef, Wine, Package } from 'lucide-react';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { styles, colors, hoverStyles } from '../lib/styles';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const SAVE_QUEUE_KEY = 'inventory-save-queue';

interface InventoryEntry {
  item_id: number;
  item_name: string;
  category_name: string;
  qty_restaurant: number;
  qty_office: number;
}

interface ChecklistItem {
  name: string;
  items: Array<{
    item_id: number;
    name: string;
    par_level: number;
    supplier_id: number | null;
    supplier_name: string | null;
  }>;
}

export function InventoryPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [entries, setEntries] = useState<Record<string, { qty_restaurant: number; qty_office: number }>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  // Restore any queued entries that were saved locally while offline
  useEffect(() => {
    const queued = localStorage.getItem(SAVE_QUEUE_KEY);
    if (queued) {
      try {
        const parsed = JSON.parse(queued);
        if (Object.keys(parsed).length > 0) setEntries(parsed);
      } catch {
        localStorage.removeItem(SAVE_QUEUE_KEY);
      }
    }
  }, []);

  // Notify user when they come back online with queued entries pending
  useEffect(() => {
    if (!isOnline) return;
    const queued = localStorage.getItem(SAVE_QUEUE_KEY);
    if (queued) {
      try {
        const parsed = JSON.parse(queued);
        if (Object.keys(parsed).length > 0) {
          toast.info('Back online — tap Save Count to sync your queued entries.');
        }
      } catch {}
    }
  }, [isOnline]);

  const { data: checklist, isLoading } = useQuery({
    queryKey: ['inventory', date],
    queryFn: async () => {
      const response = await api.get('/inventory', { params: { date } });
      return response.data.data as ChecklistItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const entryList = Object.entries(entries).map(([itemKey, { qty_restaurant, qty_office }]) => ({
        item_id: parseInt(itemKey),
        qty_restaurant,
        qty_office,
      }));
      await api.post('/inventory/save', { entries: entryList }, { params: { date } });
    },
    onSuccess: () => {
      localStorage.removeItem(SAVE_QUEUE_KEY);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setEntries({});
      toast.success('Inventory count saved successfully.');
    },
    onError: (err: any) => {
      const isNetworkError = !err.response;
      if (isNetworkError) {
        localStorage.setItem(SAVE_QUEUE_KEY, JSON.stringify(entries));
        toast.error('You are offline. Entries saved locally — they will sync when you reconnect.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save inventory.');
      }
    },
  });

  const handleInputChange = (itemKey: string, field: 'qty_restaurant' | 'qty_office', value: string) => {
    const numValue = parseFloat(value) || 0;
    setEntries(prev => ({
      ...prev,
      [itemKey]: {
        qty_restaurant: prev[itemKey]?.qty_restaurant ?? 0,
        qty_office: prev[itemKey]?.qty_office ?? 0,
        [field]: numValue,
      },
    }));
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // Build unique supplier list from checklist data
  const suppliers = checklist
    ? Array.from(
        new Map(
          checklist
            .flatMap(cat => cat.items)
            .filter(item => item.supplier_id !== null)
            .map(item => [item.supplier_id, item.supplier_name])
        ).entries()
      ).sort((a, b) => (a[1] ?? '').localeCompare(b[1] ?? ''))
    : [];

  // Apply supplier filter to checklist (drop empty categories)
  const filteredChecklist = checklist
    ?.map(cat => ({
      ...cat,
      items: supplierFilter === 'all'
        ? cat.items
        : cat.items.filter(item => String(item.supplier_id) === supplierFilter),
    }))
    .filter(cat => cat.items.length > 0);

  const totalItems = filteredChecklist?.reduce((sum, cat) => sum + cat.items.length, 0) || 0;
  const filteredItemIds = new Set(filteredChecklist?.flatMap(cat => cat.items.map(i => i.item_id.toString())) ?? []);
  const filledItems = Object.keys(entries).filter(id => filteredItemIds.has(id)).length;
  const progressPercent = totalItems > 0 ? (filledItems / totalItems) * 100 : 0;

  return (
    <Layout title="Inventory Count">
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header Card */}
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' as const, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <p style={styles.cardLabel}>Date</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{...styles.input, marginTop: '8px', width: '100%'}}
              />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <p style={styles.cardLabel}>Supplier</p>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                style={{...styles.input, marginTop: '8px', width: '100%', cursor: 'pointer'}}
              >
                <option value="all">All Suppliers</option>
                {suppliers.map(([id, name]) => (
                  <option key={id} value={String(id)}>{name}</option>
                ))}
              </select>
            </div>
            <div style={{ textAlign: 'right', minWidth: '80px' }}>
              <p style={styles.cardLabel}>Progress</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: colors.accent, marginTop: '8px', fontFamily: "'DM Mono', monospace" }}>{filledItems}/{totalItems}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '6px', backgroundColor: colors.bgInput, borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{ height: '100%', backgroundColor: colors.accent, transition: 'width 0.3s', width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Checklist */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredChecklist?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 16px', color: colors.textSecondary }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📋</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary }}>
              {supplierFilter === 'all' ? 'No active items' : 'No items for this supplier'}
            </p>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>
              {supplierFilter === 'all' ? 'Ask your manager to add items to the inventory.' : 'Try selecting a different supplier.'}
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '96px' }}>
            {filteredChecklist?.map((category) => {
              const isExpanded = expandedCategories[category.name] !== false;
              const CategoryIcon = ({
                'Vegetables & Produce': Leaf,
                'Dairy & Pantry': Milk,
                'Meat & Protein': Beef,
                'Beverages': Wine,
              } as Record<string, typeof Package>)[category.name] ?? Package;

              return (
                <div key={category.name}>
                  {/* Category Header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    style={{
                      width: '100%',
                      ...styles.card,
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      border: `1px solid ${isExpanded ? colors.accent : colors.borderSubtle}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) e.currentTarget.style.borderColor = colors.accent;
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) e.currentTarget.style.borderColor = colors.borderSubtle;
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CategoryIcon size={20} color={isExpanded ? colors.accent : colors.textSecondary} />
                      <h2 style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary }}>{category.name}</h2>
                      <span style={styles.badgeActive}>
                        {category.items.length}
                      </span>
                    </div>
                    <span style={{ color: colors.textSecondary, transition: 'transform 0.15s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      ›
                    </span>
                  </button>

                  {/* Category Items */}
                  {isExpanded && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '4px' }}>
                      {category.items.map((item, idx) => {
                        const itemKey = item.item_id.toString();
                        const isFilled = entries[itemKey];
                        const restaurant = entries[itemKey]?.qty_restaurant ?? '';
                        const office = entries[itemKey]?.qty_office ?? '';

                        return (
                          <div
                            key={itemKey}
                            style={{
                              ...styles.card,
                              padding: '12px',
                              display: 'flex',
                              flexDirection: 'column' as const,
                              gap: '12px',
                              borderLeft: `4px solid ${isFilled ? colors.accent : 'transparent'}`,
                              backgroundColor: isFilled ? colors.bgInput : colors.bgCard,
                            }}
                            onMouseEnter={(e) => {
                              if (!isFilled) e.currentTarget.style.borderLeftColor = colors.borderStrong;
                            }}
                            onMouseLeave={(e) => {
                              if (!isFilled) e.currentTarget.style.borderLeftColor = 'transparent';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary }}>{item.name}</p>
                                <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                                  Must Have: <span style={{ fontFamily: "\"DM Mono\", monospace", fontWeight: 'bold', color: colors.accent }}>{item.par_level}</span>
                                </p>
                              </div>
                            </div>

                            {/* Input Fields */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <p style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Restaurant</p>
                                <input
                                  key={`rest-${itemKey}`}
                                  type="number"
                                  step="0.5"
                                  value={restaurant}
                                  onChange={(e) => handleInputChange(itemKey, 'qty_restaurant', e.target.value)}
                                  inputMode="numeric"
                                  onFocus={(e) => e.target.select()}
                                  style={{...styles.input, width: '64px', height: '44px', textAlign: 'center', padding: '8px'}}
                                  placeholder="0"
                                />
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <p style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Office</p>
                                <input
                                  key={`office-${itemKey}`}
                                  type="number"
                                  step="0.5"
                                  value={office}
                                  onChange={(e) => handleInputChange(itemKey, 'qty_office', e.target.value)}
                                  inputMode="numeric"
                                  onFocus={(e) => e.target.select()}
                                  style={{...styles.input, width: '64px', height: '44px', textAlign: 'center', padding: '8px'}}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Sticky Save Button */}
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.bgBase,
              borderTop: `1px solid ${colors.borderSubtle}`,
              padding: '16px',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
              maxWidth: '900px',
              margin: '0 auto',
            }}>
              <button
                type="submit"
                disabled={saveMutation.isPending || Object.keys(entries).length === 0}
                style={{
                  ...styles.buttonPrimary,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: (saveMutation.isPending || Object.keys(entries).length === 0) ? 0.5 : 1,
                  cursor: (saveMutation.isPending || Object.keys(entries).length === 0) ? 'not-allowed' : 'pointer',
                }}
                {...hoverStyles.buttonPrimary}
              >
                {saveMutation.isPending ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Count
                    {filledItems > 0 && <span style={{ marginLeft: 'auto', ...styles.badgeActive }}>{filledItems} filled</span>}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

    </Layout>
  );
}
