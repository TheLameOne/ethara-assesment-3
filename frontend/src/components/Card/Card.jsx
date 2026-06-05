import styles from './Card.module.css';

export default function Card({ children, variant = 'light', className = '', style }) {
  const cls = [styles.card, styles[variant], className].filter(Boolean).join(' ');
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}
