import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import DataTable from '../../components/DataTable/DataTable';
import Input from '../../components/Input/Input';
import Toast from '../../components/Toast/Toast';
import { getOrders, deleteOrder } from '../../services/orders';
import { formatCurrency, formatDate } from '../../utils/format';
import styles from './Orders.module.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  const filtered = search.trim()
    ? orders.filter(
        (o) =>
          String(o.id).includes(search) ||
          o.customer?.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const columns = [
    { key: 'id', label: 'Order #', render: (r) => `#${r.id}` },
    { key: 'customer', label: 'Customer', render: (r) => r.customer?.full_name ?? '—' },
    { key: 'total_amount', label: 'Total', render: (r) => formatCurrency(r.total_amount) },
    {
      key: 'created_at',
      label: 'Date',
      render: (r) => formatDate(r.created_at, 'medium'),
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

      <div className={styles.searchBar}>
        <Input
          id="order-search"
          placeholder="Search by order # or customer name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage={search ? 'No orders match your search.' : 'No orders yet.'}
        />
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

