import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import DataTable from '../../components/DataTable/DataTable';
import Toast from '../../components/Toast/Toast';
import { getOrder, deleteOrder } from '../../services/orders';
import styles from './OrderDetail.module.css';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getOrder(id)
      .then(setOrder)
      .catch(() => setToast({ type: 'error', message: 'Order not found.' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel and delete this order? Stock will be restored.')) return;
    try {
      await deleteOrder(id);
      navigate('/orders');
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to cancel order.' });
    }
  };

  const itemColumns = [
    { key: 'product', label: 'Product', render: (r) => r.product?.name ?? '—' },
    { key: 'sku', label: 'SKU', render: (r) => <code className={styles.sku}>{r.product?.sku}</code> },
    { key: 'unit_price', label: 'Unit Price', render: (r) => `$${parseFloat(r.unit_price).toFixed(2)}` },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'line_total',
      label: 'Line Total',
      render: (r) => `$${(parseFloat(r.unit_price) * r.quantity).toFixed(2)}`,
    },
  ];

  if (loading) return <div className="page-container page-content"><p>Loading…</p></div>;
  if (!order) return null;

  return (
    <div className="page-container page-content">
      <div className={styles.breadcrumb}>
        <Link to="/orders">← Orders</Link>
      </div>

      <div className={styles.header}>
        <div>
          <h1>Order #{order.id}</h1>
          <p className={styles.date}>
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
          </p>
        </div>
        <Button variant="danger" onClick={handleCancel}>Cancel Order</Button>
      </div>

      <div className={styles.grid}>
        {/* Customer Info */}
        <Card variant="light" className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Customer</h3>
          <p className={styles.customerName}>{order.customer.full_name}</p>
          <p className={styles.detail}>{order.customer.email}</p>
          {order.customer.phone && <p className={styles.detail}>{order.customer.phone}</p>}
        </Card>

        {/* Order Summary */}
        <Card variant="dark" className={styles.infoCard}>
          <h3 className={styles.cardTitleDark}>Order Summary</h3>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Items</span>
            <span className={styles.summaryValue}>{order.items.length}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total Amount</span>
            <span className={`${styles.summaryValue} ${styles.total}`}>
              ${parseFloat(order.total_amount).toFixed(2)}
            </span>
          </div>
        </Card>
      </div>

      <h3 className={styles.sectionTitle}>Items</h3>
      <DataTable columns={itemColumns} data={order.items} />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
