import styles from './StatsCard.module.css'

export default function StatsCard({ icon, value, label, change, trend }) {
  return (
    <div className={styles.card}>
      <div className={`${styles.icon} ${styles[icon]}`}>
        {icon === 'weight' ? (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5 5 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5 5 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        ) : (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {change && (
        <div className={`${styles.change} ${styles[trend]}`}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  )
}
