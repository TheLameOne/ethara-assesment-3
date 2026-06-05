import { useEffect } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span>{message}</span>
      <button className={styles.close} onClick={onClose} aria-label="Dismiss">✕</button>
    </div>
  );
}
