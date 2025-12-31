import { useStore } from '../lib/store'
import styles from './WaterTracker.module.css'

const GLASS_SIZE = 250 // ml

export default function WaterTracker({ showToast }) {
  const { profile, waterIntake, addWater, resetWater } = useStore()
  const today = new Date().toISOString().split('T')[0]
  const todayWater = waterIntake.find(w => w.date === today)?.amount || 0
  
  const dailyTarget = profile.waterTarget || 2000
  const glasses = Math.floor(todayWater / GLASS_SIZE)
  const progress = Math.min((todayWater / dailyTarget) * 100, 100)
  
  const handleAddGlass = () => {
    addWater(GLASS_SIZE)
    showToast(`+${GLASS_SIZE}ml 💧`)
  }
  
  const handleAddCustom = () => {
    const amount = prompt('Enter amount in ml:', '500')
    if (amount && !isNaN(amount)) {
      addWater(Number(amount))
      showToast(`+${amount}ml 💧`)
    }
  }
  
  const handleReset = () => {
    if (window.confirm('Reset today\'s water intake?')) {
      resetWater()
    }
  }
  
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>💧</div>
        <div className={styles.info}>
          <div className={styles.value}>{todayWater} ml</div>
          <div className={styles.label}>of {dailyTarget} ml goal</div>
        </div>
        <div className={styles.glasses}>{glasses} glasses</div>
      </div>
      
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className={styles.actions}>
        <button className={styles.addBtn} onClick={handleAddGlass}>
          + Glass ({GLASS_SIZE}ml)
        </button>
        <button className={styles.customBtn} onClick={handleAddCustom}>
          + Custom
        </button>
        {todayWater > 0 && (
          <button className={styles.resetBtn} onClick={handleReset}>
            ↺
          </button>
        )}
      </div>
    </div>
  )
}
