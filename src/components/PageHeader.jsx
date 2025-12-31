import styles from './PageHeader.module.css'

export default function PageHeader({ title, onBack }) {
  return (
    <header className={styles.header}>
      {onBack && (
        <button className={styles.backBtn} onClick={onBack}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
    </header>
  )
}
