import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Card from '../../components/Card/Card';
import Toast from '../../components/Toast/Toast';
import { getProducts } from '../../services/products';
import { getCustomers } from '../../services/customers';
import { createOrder } from '../../services/orders';
import { formatCurrency } from '../../utils/format';
import styles from './NewOrder.module.css';

export default function NewOrder() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers()])
      .then(([p, c]) => { setProducts(p); setCustomers(c); })
      .catch(() => setGlobalError('Failed to load products or customers.'));
  }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) => {
    const next = items.map((it, idx) => idx === i ? { ...it, [field]: value } : it);
    setItems(next);
  };

  const validate = () => {
    const e = {};
    if (!customerId) e.customerId = 'Select a customer';
    items.forEach((it, i) => {
      if (!it.product_id) e[`product_${i}`] = 'Select a product';
      if (!it.quantity || it.quantity < 1) e[`qty_${i}`] = 'Min 1';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const computePreview = () =>
    items.reduce((sum, it) => {
      const p = products.find((x) => String(x.id) === String(it.product_id));
      return sum + (p ? parseFloat(p.price) * (parseInt(it.quantity) || 0) : 0);
    }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await createOrder({
        customer_id: parseInt(customerId),
        items: items.map((it) => ({
          product_id: parseInt(it.product_id),
          quantity: parseInt(it.quantity),
        })),
      });
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setGlobalError(err.message || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  const preview = computePreview();

  return (
    <div className="page-container page-content">
      <div className={styles.header}>
        <h1>New Order</h1>
        <p className={styles.sub}>Select a customer and add products.</p>
      </div>

      {globalError && <p className={styles.globalError}>{globalError}</p>}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Customer selection */}
        <Card variant="light" className={styles.section}>
          <h3 className={styles.sectionTitle}>Customer</h3>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="customer">Customer</label>
            <select
              id="customer"
              className={`${styles.select} ${errors.customerId ? styles.selectError : ''}`}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">— Select customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
              ))}
            </select>
            {errors.customerId && <span className={styles.fieldError}>{errors.customerId}</span>}
          </div>
        </Card>

        {/* Line items */}
        <Card variant="light" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Order Items</h3>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>+ Add Item</Button>
          </div>

          {items.map((item, i) => {
            const selectedProduct = products.find((p) => String(p.id) === String(item.product_id));
            return (
              <div key={i} className={styles.itemRow}>
                <div className={styles.productSelect}>
                  <label className={styles.label}>Product</label>
                  <select
                    className={`${styles.select} ${errors[`product_${i}`] ? styles.selectError : ''}`}
                    value={item.product_id}
                    onChange={(e) => updateItem(i, 'product_id', e.target.value)}
                  >
                    <option value="">— Select product —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.quantity_in_stock}) — {formatCurrency(p.price)}
                      </option>
                    ))}
                  </select>
                  {errors[`product_${i}`] && <span className={styles.fieldError}>{errors[`product_${i}`]}</span>}
                </div>

                <div className={styles.qtyWrap}>
                  <Input
                    label="Qty"
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity_in_stock ?? undefined}
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                    error={errors[`qty_${i}`]}
                  />
                </div>

                {selectedProduct && (
                  <div className={styles.lineTotal}>
                    {formatCurrency(parseFloat(selectedProduct.price) * (parseInt(item.quantity) || 0))}
                  </div>
                )}

                {items.length > 1 && (
                  <Button type="button" variant="text" size="sm" onClick={() => removeItem(i)} className={styles.removeBtn}>
                    ✕
                  </Button>
                )}
              </div>
            );
          })}
        </Card>

        {/* Total preview + submit */}
        <Card variant="dark" className={styles.totalCard}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Estimated Total</span>
            <span className={styles.totalValue}>{formatCurrency(preview)}</span>
          </div>
          <p className={styles.totalNote}>Final total is calculated by the server.</p>
        </Card>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => navigate('/orders')}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Placing Order…' : 'Place Order'}
          </Button>
        </div>
      </form>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
