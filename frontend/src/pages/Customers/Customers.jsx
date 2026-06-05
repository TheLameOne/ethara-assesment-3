import { useEffect, useState, useCallback } from 'react';
import Button from '../../components/Button/Button';
import DataTable from '../../components/DataTable/DataTable';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Toast from '../../components/Toast/Toast';
import { getCustomers, createCustomer, deleteCustomer } from '../../services/customers';
import styles from './Customers.module.css';

const EMPTY_FORM = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getCustomers()
      .then(setCustomers)
      .catch(() => setToast({ type: 'error', message: 'Failed to load customers.' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setErrors({}); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createCustomer({ full_name: form.full_name.trim(), email: form.email.trim(), phone: form.phone.trim() || null });
      setToast({ type: 'success', message: 'Customer created.' });
      closeModal();
      load();
    } catch (err) {
      setErrors({ _global: err.message || 'An error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      setToast({ type: 'success', message: 'Customer deleted.' });
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Delete failed.' });
    }
  };

  const columns = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email', render: (r) => <a href={`mailto:${r.email}`}>{r.email}</a> },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || <span style={{ color: 'var(--color-muted-soft)' }}>—</span> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <div className="page-container page-content">
      <div className={styles.header}>
        <div>
          <h1>Customers</h1>
          <p className={styles.sub}>Manage your customer list.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ Add Customer</Button>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : (
        <DataTable columns={columns} data={customers} emptyMessage="No customers yet." />
      )}

      {modalOpen && (
        <Modal
          title="Add Customer"
          onClose={closeModal}
          footer={
            <>
              <Button variant="secondary" onClick={closeModal} disabled={submitting}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving…' : 'Create'}
              </Button>
            </>
          }
        >
          {errors._global && <p className={styles.globalError}>{errors._global}</p>}
          <Input id="full_name" label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} error={errors.full_name} placeholder="Jane Doe" />
          <Input id="email" label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} placeholder="jane@example.com" />
          <Input id="phone" label="Phone (optional)" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
        </Modal>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
