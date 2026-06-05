import { useEffect, useState } from 'react';
import Card from '../../components/Card/Card';
import { getDashboard } from '../../services/dashboard';
import styles from './Dashboard.module.css';

const METRICS = [
  { key: 'total_products', label: 'Total Products', icon: '📦' },
  { key: 'total_customers', label: 'Total Customers', icon: '👥' },
  { key: 'total_orders', label: 'Total Orders', icon: '🧾' },
  { key: 'low_stock_products', label: 'Low Stock (<10)', icon: '⚠️' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard data.'));
  }, []);

  return (
    <div className="page-container page-content">
      <div className={styles.hero}>
        <h1>Dashboard</h1>
        <p className={styles.sub}>Your inventory at a glance.</p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        {METRICS.map((m) => (
          <Card key={m.key} variant="dark" className={styles.metricCard}>
            <div className={styles.icon}>{m.icon}</div>
            <div className={styles.value}>
              {stats ? stats[m.key] : '—'}
            </div>
            <div className={styles.label}>{m.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
