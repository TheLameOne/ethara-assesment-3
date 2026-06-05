import { NavLink, Link } from 'react-router-dom';
import Button from '../Button/Button';
import styles from './TopNav.module.css';
import { useState } from 'react';
import { useTheme } from '../../App';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
];

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

        {/* Right side: theme toggle + CTA */}
        <div className={styles.rightGroup}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
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
          <div className={styles.drawerActions}>
            <button
              className={styles.themeToggle}
              onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              <span style={{ marginLeft: 8, fontSize: 14 }}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            <Link to="/orders/new" onClick={() => setOpen(false)}>
              <Button variant="primary" size="sm" style={{ width: '100%' }}>New Order</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function SpikeMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <line x1="9" y1="0" x2="9" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2.6" y1="2.6" x2="15.4" y2="15.4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="15.4" y1="2.6" x2="2.6" y2="15.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

