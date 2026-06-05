import { NavLink, Link } from 'react-router-dom';
import Button from '../Button/Button';
import styles from './TopNav.module.css';
import { useState } from 'react';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
];

export default function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={`${styles.inner} page-container`}>
        {/* Wordmark */}
        <Link to="/" className={styles.wordmark}>
          <SpikeMark />
          <span>Inventory</span>
        </Link>

        {/* Desktop links */}
        <ul className={styles.links}>
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ''}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className={styles.cta}>
          <Link to="/orders/new">
            <Button variant="primary" size="sm">New Order</Button>
          </Link>
        </div>

        {/* Hamburger */}
        <button className={styles.hamburger} onClick={() => setOpen(!open)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className={styles.drawer} onClick={() => setOpen(false)}>
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `${styles.drawerLink} ${isActive ? styles.active : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/orders/new" onClick={() => setOpen(false)}>
            <Button variant="primary" size="sm" style={{ width: '100%' }}>New Order</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}

function SpikeMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <line x1="9" y1="0" x2="9" y2="18" stroke="#141413" strokeWidth="1.5" />
      <line x1="0" y1="9" x2="18" y2="9" stroke="#141413" strokeWidth="1.5" />
      <line x1="2.6" y1="2.6" x2="15.4" y2="15.4" stroke="#141413" strokeWidth="1.5" />
      <line x1="15.4" y1="2.6" x2="2.6" y2="15.4" stroke="#141413" strokeWidth="1.5" />
    </svg>
  );
}
