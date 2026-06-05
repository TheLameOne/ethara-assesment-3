import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} page-container`}>
        <span className={styles.brand}>✦ Inventory Manager</span>
        <span className={styles.copy}>© {new Date().getFullYear()} — Built with FastAPI & React</span>
      </div>
    </footer>
  );
}
