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
import { colors } from '../lib/styles';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'manager' | 'employee';
  is_active: boolean;
  created_at: string;
}

export function UsersPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'employee', is_active: '1', password: '', password_confirmation: '' });
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data.data,
  });

  const set = (field: string) => (val: string) => setFormData(f => ({ ...f, [field]: val }));

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = { ...data, is_active: data.is_active === '1' };
      if (editingId) {
        await api.put(`/users/${editingId}`, payload);
      } else {
        await api.post('/users', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(editingId ? 'User updated.' : 'User created.');
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/users/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted.'); },
    onError: () => toast.error('Failed to delete user.'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: number) => { await api.post(`/users/${id}/reset-password`); },
    onSuccess: () => toast.success('Password reset successfully.'),
    onError: () => toast.error('Failed to reset password.'),
  });

  const handleEdit = (user: User) => {
    setFormData({ name: user.name, email: user.email, role: user.role, is_active: user.is_active ? '1' : '0', password: '', password_confirmation: '' });
    setEditingId(user.id);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'employee', is_active: '1', password: '', password_confirmation: '' });
    saveMutation.reset();
  };

  const passwordMismatch = !editingId && formData.password_confirmation !== '' && formData.password !== formData.password_confirmation;
  const errorMsg = saveMutation.isError ? (saveMutation.error as any)?.response?.data?.message ?? 'An error occurred.' : null;

  return (
    <Layout title="Users Management">
      <PageHeader addLabel="Add User" onAdd={() => setIsOpen(true)} />

      <DataTable
        isLoading={isLoading}
        data={users}
        keyExtractor={(r: User) => r.id}
        emptyMessage="No users yet."
        columns={[
          { header: 'Name',    render: (r: User) => r.name },
          { header: 'Email',   render: (r: User) => r.email },
          { header: 'Role',    align: 'center', render: (r: User) => <StatusBadge variant={r.role}>{r.role}</StatusBadge> },
          { header: 'Status',  align: 'center', render: (r: User) => <StatusBadge variant={r.is_active ? 'active' : 'inactive'}>{r.is_active ? 'Active' : 'Inactive'}</StatusBadge> },
          { header: 'Actions', align: 'center', render: (r: User) => (
            <RowActions
              onEdit={() => handleEdit(r)}
              onReset={() => resetPasswordMutation.mutate(r.id)}
              onDelete={() => deleteMutation.mutate(r.id)}
              isDeleting={deleteMutation.isPending}
              deleteConfirmMessage={`Delete user "${r.name}"? This cannot be undone.`}
            />
          )},
        ]}
      />

      <Modal
        isOpen={isOpen}
        title={editingId ? 'Edit User' : 'Add New User'}
        subtitle={editingId ? 'Update user account details' : 'Create a new user account'}
        icon={editingId ? '✏️' : '👤'}
        onClose={handleClose}
        onSubmit={(e) => { e.preventDefault(); if (!passwordMismatch) saveMutation.mutate(formData); }}
        isSaving={saveMutation.isPending || (!editingId && passwordMismatch)}
        saveLabel={editingId ? 'Update User' : 'Create User'}
        error={errorMsg}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormInput label="Full Name" value={formData.name} onChange={set('name')} placeholder="John Doe" required />
          <FormSelect
            label="Role"
            value={formData.role}
            onChange={set('role')}
            options={[{ value: 'employee', label: 'Employee' }, { value: 'manager', label: 'Manager' }]}
          />
        </div>
        <FormInput label="Email Address" type="email" value={formData.email} onChange={set('email')} placeholder="john@example.com" required />
        <FormSelect
          label="Status"
          value={formData.is_active}
          onChange={set('is_active')}
          options={[{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]}
        />
        {!editingId && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput label="Password" type="password" value={formData.password} onChange={set('password')} placeholder="Min. 8 characters" required minLength={8} />
            <div>
              <FormInput
                label="Confirm Password"
                type="password"
                value={formData.password_confirmation}
                onChange={set('password_confirmation')}
                placeholder="Repeat password"
                required
                error={passwordMismatch ? 'Passwords do not match' : undefined}
                style={{ borderColor: passwordMismatch ? colors.red : undefined }}
              />
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
