import { useEffect, useState, useCallback } from 'react';
import Button from '../../components/Button/Button';
import DataTable from '../../components/DataTable/DataTable';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Badge from '../../components/Badge/Badge';
import Toast from '../../components/Toast/Toast';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/products';
import styles from './Products.module.css';

const EMPTY_FORM = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(() => setToast({ type: 'error', message: 'Failed to load products.' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true); };
  const openEdit = (p) => {
    setEditTarget(p);
    setForm({ name: p.name, sku: p.sku, price: String(p.price), quantity_in_stock: String(p.quantity_in_stock) });
    setErrors({});
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    if (!form.quantity_in_stock || isNaN(form.quantity_in_stock) || Number(form.quantity_in_stock) < 0)
      e.quantity_in_stock = 'Valid quantity required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    };
    try {
      if (editTarget) {
        await updateProduct(editTarget.id, payload);
        setToast({ type: 'success', message: 'Product updated.' });
      } else {
        await createProduct(payload);
        setToast({ type: 'success', message: 'Product created.' });
      }
      closeModal();
      load();
    } catch (err) {
      setErrors({ _global: err.message || 'An error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setToast({ type: 'success', message: 'Product deleted.' });
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Delete failed.' });
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'sku', label: 'SKU', render: (r) => <code className={styles.sku}>{r.sku}</code> },
    { key: 'price', label: 'Price', render: (r) => `$${parseFloat(r.price).toFixed(2)}` },
    {
      key: 'quantity_in_stock',
      label: 'Stock',
      render: (r) => (
        <Badge variant={r.quantity_in_stock < 10 ? 'error' : r.quantity_in_stock < 20 ? 'warning' : 'success'}>
          {r.quantity_in_stock}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container page-content">
      <div className={styles.header}>
        <div>
          <h1>Products</h1>
          <p className={styles.sub}>Manage your product catalog.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ Add Product</Button>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : (
        <DataTable columns={columns} data={products} emptyMessage="No products yet. Add your first product." />
      )}

      {modalOpen && (
        <Modal
          title={editTarget ? 'Edit Product' : 'Add Product'}
          onClose={closeModal}
          footer={
            <>
              <Button variant="secondary" onClick={closeModal} disabled={submitting}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving…' : editTarget ? 'Update' : 'Create'}
              </Button>
            </>
          }
        >
          {errors._global && <p className={styles.globalError}>{errors._global}</p>}
          <Input id="name" label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} placeholder="e.g. Wireless Keyboard" />
          <Input id="sku" label="SKU / Code" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} error={errors.sku} placeholder="e.g. KBD-001" />
          <Input id="price" label="Price ($)" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} error={errors.price} placeholder="0.00" />
          <Input id="quantity_in_stock" label="Quantity in Stock" type="number" min="0" value={form.quantity_in_stock} onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })} error={errors.quantity_in_stock} placeholder="0" />
        </Modal>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
