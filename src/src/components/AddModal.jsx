import styles from './Modal.module.css'

const options = [
  { id: 'food', icon: '🍽️', label: 'Log Food', color: 'green' },
  { id: 'workout', icon: '🏋️', label: 'Log Workout', color: 'orange' },
  { id: 'weight', icon: '⚖️', label: 'Log Weight', color: 'blue' },
  { id: 'quick', icon: '⚡', label: 'Quick Log', color: 'purple' },
]

export default function AddModal({ onClose, onSelect }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Quick Add</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={styles.addMenu}>
          {options.map(opt => (
            <button 
              key={opt.id}
              className={styles.addMenuItem}
              onClick={() => onSelect(opt.id)}
            >
              <div className={`${styles.addMenuIcon} ${styles[opt.color]}`}>
                {opt.icon}
              </div>
              <div className={styles.addMenuLabel}>{opt.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
