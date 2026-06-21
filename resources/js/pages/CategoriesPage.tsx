import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { FormInput } from '../components/ui/FormInput';
import { RowActions } from '../components/ui/RowActions';

interface Category {
  id: number;
  name: string;
  sort_order: number;
  created_at: string;
}

export function CategoriesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', sort_order: '' });
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.data,
  });

  const set = (field: string) => (val: string) => setFormData(f => ({ ...f, [field]: val }));

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = { ...data, sort_order: parseInt(data.sort_order) };
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
      } else {
        await api.post('/categories', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(editingId ? 'Category updated.' : 'Category created.');
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/categories/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category deleted.'); },
    onError: () => toast.error('Failed to delete category.'),
  });

  const handleEdit = (category: Category) => {
    setFormData({ name: category.name, sort_order: category.sort_order.toString() });
    setEditingId(category.id);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: '', sort_order: '' });
  };

  const errorMsg = saveMutation.isError ? (saveMutation.error as any)?.response?.data?.message ?? 'An error occurred.' : null;

  return (
    <Layout title="Categories Management">
      <PageHeader addLabel="Add Category" onAdd={() => setIsOpen(true)} />

      <DataTable
        isLoading={isLoading}
        data={categories}
        keyExtractor={(r: Category) => r.id}
        emptyMessage="No categories yet. Click + Add Category to get started."
        columns={[
          { header: 'Name', render: (r: Category) => r.name },
          { header: 'Sort', align: 'center', render: (r: Category) => <span style={{ fontFamily: "'DM Mono', monospace" }}>{r.sort_order}</span> },
          { header: 'Actions', align: 'center', render: (r: Category) => (
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
        title={editingId ? 'Edit Category' : 'Add New Category'}
        subtitle={editingId ? 'Update category details' : 'Create a new category'}
        icon="🏷️"
        onClose={handleClose}
        onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }}
        isSaving={saveMutation.isPending}
        saveLabel={editingId ? 'Update Category' : 'Create Category'}
        error={errorMsg}
      >
        <FormInput label="Name" value={formData.name} onChange={set('name')} placeholder="Category name" required />
        <FormInput label="Sort Order" type="number" value={formData.sort_order} onChange={set('sort_order')} placeholder="0" required />
      </Modal>
    </Layout>
  );
}
