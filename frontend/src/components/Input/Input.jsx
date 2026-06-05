import styles from './Input.module.css';

export default function Input({
  label,
  id,
  error,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className={styles.field}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <input
        id={id}
        type={type}
        className={`${styles.input} ${error ? styles.hasError : ''} ${className}`}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
