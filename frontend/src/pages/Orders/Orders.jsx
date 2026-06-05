import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import DataTable from '../../components/DataTable/DataTable';
import Toast from '../../components/Toast/Toast';
import { getOrders, deleteOrder } from '../../services/orders';
import styles from './Orders.module.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getOrders()
      .then(setOrders)
      .catch(() => setToast({ type: 'error', message: 'Failed to load orders.' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel and delete this order? Stock will be restored.')) return;
    try {
      await deleteOrder(id);
      setToast({ type: 'success', message: 'Order cancelled and stock restored.' });
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to cancel order.' });
    }
  };

  const columns = [
    { key: 'id', label: 'Order #', render: (r) => `#${r.id}` },
    { key: 'customer', label: 'Customer', render: (r) => r.customer?.full_name ?? '—' },
    { key: 'total_amount', label: 'Total', render: (r) => `$${parseFloat(r.total_amount).toFixed(2)}` },
    {
      key: 'created_at',
      label: 'Date',
      render: (r) => new Date(r.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' }),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className={styles.actions}>
          <Link to={`/orders/${r.id}`}>
            <Button variant="secondary" size="sm">View</Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => handleCancel(r.id)}>Cancel</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container page-content">
      <div className={styles.header}>
        <div>
          <h1>Orders</h1>
          <p className={styles.sub}>All customer orders.</p>
        </div>
        <Link to="/orders/new">
          <Button variant="primary">+ New Order</Button>
        </Link>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : (
        <DataTable columns={columns} data={orders} emptyMessage="No orders yet." />
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
