import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
}) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[`size_${size}`],
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
