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
import { FormTextarea } from '../components/ui/FormTextarea';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RowActions } from '../components/ui/RowActions';

interface Supplier {
  id: number;
  name: string;
  phone: string;
  notes: string;
  is_active: boolean;
  created_at: string;
}

export function SuppliersPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '', is_active: '1' });
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => (await api.get('/suppliers')).data.data,
  });

  const set = (field: string) => (val: string) => setFormData(f => ({ ...f, [field]: val }));

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = { ...data, is_active: data.is_active === '1' };
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, payload);
      } else {
        await api.post('/suppliers', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(editingId ? 'Supplier updated.' : 'Supplier created.');
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/suppliers/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Supplier deleted.'); },
    onError: () => toast.error('Failed to delete supplier.'),
  });

  const handleEdit = (supplier: Supplier) => {
    setFormData({ name: supplier.name, phone: supplier.phone, notes: supplier.notes, is_active: supplier.is_active ? '1' : '0' });
    setEditingId(supplier.id);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', notes: '', is_active: '1' });
  };

  const errorMsg = saveMutation.isError ? (saveMutation.error as any)?.response?.data?.message ?? 'An error occurred.' : null;

  return (
    <Layout title="Suppliers Management">
      <PageHeader addLabel="Add Supplier" onAdd={() => setIsOpen(true)} />

      <DataTable
        isLoading={isLoading}
        data={suppliers}
        keyExtractor={(r: Supplier) => r.id}
        emptyMessage="No suppliers yet. Click + Add Supplier to get started."
        columns={[
          { header: 'Name',    render: (r: Supplier) => r.name },
          { header: 'Phone',   render: (r: Supplier) => r.phone || '—' },
          { header: 'Notes',   render: (r: Supplier) => r.notes || '—' },
          { header: 'Status',  align: 'center', render: (r: Supplier) => <StatusBadge variant={r.is_active ? 'active' : 'inactive'}>{r.is_active ? 'Active' : 'Inactive'}</StatusBadge> },
          { header: 'Actions', align: 'center', render: (r: Supplier) => (
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
        title={editingId ? 'Edit Supplier' : 'Add New Supplier'}
        subtitle={editingId ? 'Update supplier details' : 'Add a new supplier'}
        icon="🚚"
        onClose={handleClose}
        onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }}
        isSaving={saveMutation.isPending}
        saveLabel={editingId ? 'Update Supplier' : 'Create Supplier'}
        error={errorMsg}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormInput label="Name" value={formData.name} onChange={set('name')} placeholder="Supplier name" required />
          <FormInput label="Phone" type="tel" value={formData.phone} onChange={set('phone')} placeholder="+1 234 567 8900" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormTextarea label="Notes" value={formData.notes} onChange={set('notes')} placeholder="Optional notes..." />
          <FormSelect
            label="Status"
            value={formData.is_active}
            onChange={set('is_active')}
            options={[{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]}
          />
        </div>
      </Modal>
    </Layout>
  );
}
