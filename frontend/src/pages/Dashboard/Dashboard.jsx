import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
} from 'recharts';
import Card from '../../components/Card/Card';
import { getDashboard, getAnalytics } from '../../services/dashboard';
import { formatCurrency, formatMonthLabel } from '../../utils/format';
import styles from './Dashboard.module.css';

const STAT_METRICS = [
  { key: 'total_products', label: 'Total Products', icon: '📦', format: (v) => v },
  { key: 'total_customers', label: 'Total Customers', icon: '👥', format: (v) => v },
  { key: 'total_orders', label: 'Total Orders', icon: '🧾', format: (v) => v },
  { key: 'low_stock_products', label: 'Low Stock (<10)', icon: '⚠️', format: (v) => v },
  { key: 'total_revenue', label: 'Total Revenue', icon: '₹', format: formatCurrency },
  { key: 'avg_order_value', label: 'Avg Order Value', icon: '📊', format: formatCurrency },
];

function SkeletonCards() {
  return Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className={`${styles.skeletonCard} skeleton`} />
  ));
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}:{' '}
          {p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

function ProductTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{payload[0]?.payload?.name}</p>
      <p style={{ color: payload[0]?.color }}>Revenue: {formatCurrency(payload[0]?.value)}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboard(), getAnalytics()])
      .then(([s, a]) => {
        setStats(s);
        setAnalytics(a);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = analytics?.monthly_revenue?.map((d) => ({
    ...d,
    label: formatMonthLabel(d.month),
  })) ?? [];

  const topProducts = analytics?.top_products ?? [];
  const lowStock = analytics?.low_stock_items ?? [];

  return (
    <div className="page-container page-content">
      <div className={styles.hero}>
        <h1>Dashboard</h1>
        <p className={styles.sub}>Your inventory at a glance.</p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* ── Stat Cards ── */}
      <div className={styles.grid}>
        {loading ? (
          <SkeletonCards />
        ) : (
          STAT_METRICS.map((m) => (
            <Card key={m.key} variant="dark" className={styles.metricCard}>
              <div className={styles.icon}>{m.icon}</div>
              <div className={styles.value}>
                {stats ? m.format(stats[m.key]) : '—'}
              </div>
              <div className={styles.label}>{m.label}</div>
            </Card>
          ))
        )}
      </div>

      {/* ── Charts Row ── */}
      {!loading && analytics && (
        <>
          <div className={styles.chartsRow}>
            {/* Revenue & Orders Trend */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Revenue & Orders — Last 6 Months</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={monthlyData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} />
                  <YAxis
                    yAxisId="revenue"
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                    width={60}
                  />
                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                    width={30}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    yAxisId="revenue"
                    dataKey="revenue"
                    name="Revenue (₹)"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="order_count"
                    name="Orders"
                    stroke="var(--color-accent-teal)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'var(--color-accent-teal)' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 Products by Revenue */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Top Products by Revenue</h3>
              {topProducts.length === 0 ? (
                <p className={styles.emptyChart}>No order data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    layout="vertical"
                    data={topProducts}
                    margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 12, fill: 'var(--color-body)' }}
                    />
                    <Tooltip content={<ProductTooltip />} />
                    <Bar
                      dataKey="total_revenue"
                      name="Revenue"
                      fill="var(--color-accent-amber)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Low Stock Alert ── */}
          {lowStock.length > 0 && (
            <div className={styles.lowStockSection}>
              <h3 className={styles.chartTitle}>
                <span className={styles.alertDot} /> Low Stock Alert ({lowStock.length} items)
              </h3>
              <div className={styles.lowStockGrid}>
                {lowStock.map((item) => (
                  <div key={item.sku} className={styles.lowStockItem}>
                    <div className={styles.lowStockName}>{item.name}</div>
                    <div className={styles.lowStockMeta}>
                      <code className={styles.lowStockSku}>{item.sku}</code>
                      <span
                        className={styles.lowStockQty}
                        style={{ color: item.quantity_in_stock === 0 ? 'var(--color-error)' : 'var(--color-warning)' }}
                      >
                        {item.quantity_in_stock === 0 ? 'Out of stock' : `${item.quantity_in_stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

