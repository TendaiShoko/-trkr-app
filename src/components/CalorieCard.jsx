import styles from './CalorieCard.module.css'

export default function CalorieCard({ 
  calories, 
  target, 
  protein, 
  carbs, 
  fat,
  proteinTarget,
  carbsTarget,
  fatTarget 
}) {
  const progress = Math.min((calories / target) * 100, 100)
  const circumference = 2 * Math.PI * 50
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.ringContainer}>
          <svg className={styles.ring} width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <circle 
              className={styles.ringBg} 
              cx="60" 
              cy="60" 
              r="50" 
            />
            <circle 
              className={styles.ringProgress} 
              cx="60" 
              cy="60" 
              r="50"
              style={{ 
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset 
              }}
            />
          </svg>
          <div className={styles.ringCenter}>
            <div className={styles.ringValue}>{calories.toLocaleString()}</div>
            <div className={styles.ringLabel}>kcal</div>
          </div>
        </div>
        
        <div className={styles.details}>
          <h3 className={styles.title}>Calories</h3>
          <div className={styles.macros}>
            <div className={styles.macro}>
              <div className={styles.macroLabel}>Protein</div>
              <div className={styles.macroBar}>
                <div 
                  className={`${styles.macroFill} ${styles.protein}`}
                  style={{ width: `${Math.min((protein / proteinTarget) * 100, 100)}%` }}
                />
              </div>
              <div className={styles.macroValue}>{Math.round(protein)}g</div>
            </div>
            <div className={styles.macro}>
              <div className={styles.macroLabel}>Carbs</div>
              <div className={styles.macroBar}>
                <div 
                  className={`${styles.macroFill} ${styles.carbs}`}
                  style={{ width: `${Math.min((carbs / carbsTarget) * 100, 100)}%` }}
                />
              </div>
              <div className={styles.macroValue}>{Math.round(carbs)}g</div>
            </div>
            <div className={styles.macro}>
              <div className={styles.macroLabel}>Fat</div>
              <div className={styles.macroBar}>
                <div 
                  className={`${styles.macroFill} ${styles.fat}`}
                  style={{ width: `${Math.min((fat / fatTarget) * 100, 100)}%` }}
                />
              </div>
              <div className={styles.macroValue}>{Math.round(fat)}g</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
