import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { FormInput } from '../components/ui/FormInput';
import { FormSelect } from '../components/ui/FormSelect';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RowActions } from '../components/ui/RowActions';

interface Item {
  id: number;
  name: string;
  full_name: string | null;
  unit: string | null;
  notes: string | null;
  category_id: number;
  category: { name: string };
  supplier_id: number | null;
  supplier: { name: string } | null;
  par_level: number | null;
  is_active: boolean;
}

interface Category { id: number; name: string; }
interface Supplier { id: number; name: string; }

export function ItemsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', full_name: '', unit: '', notes: '', category_id: '', supplier_id: '', par_level: '', is_active: '1' });
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: async () => (await api.get('/items')).data.data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.data,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => (await api.get('/suppliers')).data.data,
  });

  const set = (field: string) => (val: string) => setFormData(f => ({ ...f, [field]: val }));

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        name: data.name,
        full_name: data.full_name || null,
        unit: data.unit || null,
        notes: data.notes || null,
        category_id: parseInt(data.category_id),
        supplier_id: data.supplier_id ? parseInt(data.supplier_id) : null,
        par_level: data.par_level ? parseInt(data.par_level) : null,
        is_active: data.is_active === '1',
      };
      if (editingId) {
        await api.put(`/items/${editingId}`, payload);
      } else {
        await api.post('/items', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(editingId ? 'Item updated.' : 'Item created.');
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/items/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); toast.success('Item deleted.'); },
    onError: () => toast.error('Failed to delete item.'),
  });

  const handleEdit = (item: Item) => {
    setFormData({
      name: item.name,
      full_name: item.full_name ?? '',
      unit: item.unit ?? '',
      notes: item.notes ?? '',
      category_id: item.category_id?.toString() ?? '',
      supplier_id: item.supplier_id?.toString() ?? '',
      par_level: item.par_level?.toString() ?? '',
      is_active: item.is_active ? '1' : '0',
    });
    setEditingId(item.id);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: '', full_name: '', unit: '', notes: '', category_id: '', supplier_id: '', par_level: '', is_active: '1' });
  };

  const errorMsg = saveMutation.isError ? (saveMutation.error as any)?.response?.data?.message ?? 'An error occurred.' : null;

  return (
    <Layout title="Items Management">
      <PageHeader addLabel="Add Item" onAdd={() => setIsOpen(true)} />

      <DataTable
        isLoading={isLoading}
        data={items}
        keyExtractor={(r: Item) => r.id}
        emptyMessage="No items yet. Click + Add Item to get started."
        columns={[
          { header: 'Name',     render: (r: Item) => (
            <div>
              <p style={{ fontWeight: '600' }}>{r.name}</p>
              {r.full_name && <p style={{ fontSize: '12px', color: '#8892a4', marginTop: '2px' }}>{r.full_name}</p>}
            </div>
          )},
          { header: 'Category', render: (r: Item) => r.category.name },
          { header: 'Supplier', render: (r: Item) => r.supplier?.name ?? <span style={{ color: '#4e5770' }}>—</span> },
          { header: 'Unit',     align: 'center', render: (r: Item) => r.unit ? <span style={{ fontFamily: "'DM Mono', monospace" }}>{r.unit}</span> : <span style={{ color: '#4e5770' }}>—</span> },
          { header: 'Par',      align: 'center', render: (r: Item) => <span style={{ fontFamily: "'DM Mono', monospace" }}>{r.par_level ?? '—'}</span> },
          { header: 'Status',   align: 'center', render: (r: Item) => <StatusBadge variant={r.is_active ? 'active' : 'inactive'}>{r.is_active ? 'Active' : 'Inactive'}</StatusBadge> },
          { header: 'Actions',  align: 'center', render: (r: Item) => (
            <RowActions
              onEdit={() => handleEdit(r)}
              onDelete={() => deleteMutation.mutate(r.id)}
              isDeleting={deleteMutation.isPending}
              deleteConfirmMessage={`Delete "${r.name}"? This cannot be undone.`}
            />
          )},
        ]}
      />

      <Modal
        isOpen={isOpen}
        title={editingId ? 'Edit Item' : 'Add New Item'}
        subtitle={editingId ? 'Update item details' : 'Create a new inventory item'}
        icon="📦"
        onClose={handleClose}
        onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }}
        isSaving={saveMutation.isPending}
        saveLabel={editingId ? 'Update Item' : 'Create Item'}
        error={errorMsg}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FormInput label="Name" value={formData.name} onChange={set('name')} placeholder="e.g. Olive Oil" required containerStyle={{ marginBottom: 0 }} />
          <FormInput label="Full Name" value={formData.full_name} onChange={set('full_name')} placeholder="Full name (optional)" containerStyle={{ marginBottom: 0 }} />
          <FormSelect label="Category" value={formData.category_id} onChange={set('category_id')} placeholder="Select Category" options={categories.map((c: Category) => ({ value: c.id, label: c.name }))} required containerStyle={{ marginBottom: 0 }} />
          <FormSelect label="Supplier" value={formData.supplier_id} onChange={set('supplier_id')} placeholder="No supplier" options={suppliers.map((s: Supplier) => ({ value: s.id, label: s.name }))} containerStyle={{ marginBottom: 0 }} />
          <FormInput label="Unit" value={formData.unit} onChange={set('unit')} placeholder="kg, L, pcs…" containerStyle={{ marginBottom: 0 }} />
          <FormInput label="Par Level" type="number" value={formData.par_level} onChange={set('par_level')} placeholder="0" containerStyle={{ marginBottom: 0 }} />
          <FormSelect label="Status" value={formData.is_active} onChange={set('is_active')} options={[{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]} containerStyle={{ marginBottom: 0 }} />
          <FormInput label="Notes" value={formData.notes} onChange={set('notes')} placeholder="Optional notes…" containerStyle={{ marginBottom: 0 }} />
        </div>
      </Modal>
    </Layout>
  );
}
