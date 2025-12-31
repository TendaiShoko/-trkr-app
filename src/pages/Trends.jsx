import { useStore } from '../lib/store'
import PageHeader from '../components/PageHeader'
import styles from './Trends.module.css'

export default function Trends() {
  const { profile, getWeekStats, getWeightTrend } = useStore()
  
  const weekStats = getWeekStats()
  const weightTrend = getWeightTrend(28) // Last 4 weeks
  
  // Calculate week totals
  const totalCalories = weekStats.reduce((acc, d) => acc + d.calories, 0)
  const avgCalories = Math.round(totalCalories / 7)
  const totalWorkoutMins = weekStats.reduce((acc, d) => acc + d.workoutMinutes, 0)
  const workoutDays = weekStats.filter(d => d.workoutMinutes > 0).length
  
  // Max values for scaling bars
  const maxCalories = Math.max(...weekStats.map(d => d.calories), profile.dailyCalorieTarget)
  const maxWorkout = Math.max(...weekStats.map(d => d.workoutMinutes), 60)
  
  // Weight stats
  const weights = weightTrend.filter(w => w.weight_kg)
  const startWeight = weights[0]?.weight_kg || 0
  const currentWeight = weights[weights.length - 1]?.weight_kg || 0
  const weightChange = currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : 0
  
  // Group weights by week for chart
  const weeklyWeights = []
  for (let i = 0; i < 4; i++) {
    const weekWeights = weights.slice(i * 7, (i + 1) * 7)
    if (weekWeights.length > 0) {
      const avg = weekWeights.reduce((a, w) => a + w.weight_kg, 0) / weekWeights.length
      weeklyWeights.push({ week: `W${i + 1}`, weight: avg })
    }
  }
  
  const maxWeight = Math.max(...weeklyWeights.map(w => w.weight), 100)
  const minWeight = Math.min(...weeklyWeights.map(w => w.weight), 50)
  const weightRange = maxWeight - minWeight || 10
  
  return (
    <div className={styles.page}>
      <PageHeader title="Trends" />
      
      <section className={styles.section}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Weekly Calories</div>
            <div className={styles.cardPeriod}>This Week</div>
          </div>
          
          <div className={styles.chart}>
            {weekStats.map((day, i) => (
              <div key={i} className={styles.barContainer}>
                <div 
                  className={`${styles.bar} ${styles.calories}`}
                  style={{ height: `${(day.calories / maxCalories) * 100}%` }}
                />
                <span className={styles.barLabel}>{day.dayName.charAt(0)}</span>
              </div>
            ))}
          </div>
          
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{totalCalories.toLocaleString()}</div>
              <div className={styles.summaryLabel}>Total</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{avgCalories.toLocaleString()}</div>
              <div className={styles.summaryLabel}>Daily Avg</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{profile.dailyCalorieTarget.toLocaleString()}</div>
              <div className={styles.summaryLabel}>Target</div>
            </div>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Weight Progress</div>
            <div className={styles.cardPeriod}>Last 4 Weeks</div>
          </div>
          
          <div className={styles.chart}>
            {weeklyWeights.length > 0 ? (
              weeklyWeights.map((week, i) => (
                <div key={i} className={styles.barContainer}>
                  <div 
                    className={`${styles.bar} ${styles.weight}`}
                    style={{ height: `${((week.weight - minWeight + 5) / (weightRange + 10)) * 100}%` }}
                  />
                  <span className={styles.barLabel}>{week.week}</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyChart}>No weight data yet</div>
            )}
          </div>
          
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{startWeight || '--'}</div>
              <div className={styles.summaryLabel}>Start</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{currentWeight || '--'}</div>
              <div className={styles.summaryLabel}>Current</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={`${styles.summaryValue} ${Number(weightChange) < 0 ? styles.positive : ''}`}>
                {weightChange > 0 ? '+' : ''}{weightChange}
              </div>
              <div className={styles.summaryLabel}>Change</div>
            </div>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Workout Hours</div>
            <div className={styles.cardPeriod}>This Week</div>
          </div>
          
          <div className={styles.chart}>
            {weekStats.map((day, i) => (
              <div key={i} className={styles.barContainer}>
                <div 
                  className={`${styles.bar} ${styles.workout}`}
                  style={{ height: `${(day.workoutMinutes / maxWorkout) * 100}%` }}
                />
                <span className={styles.barLabel}>{day.dayName.charAt(0)}</span>
              </div>
            ))}
          </div>
          
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{(totalWorkoutMins / 60).toFixed(1)}</div>
              <div className={styles.summaryLabel}>Hours</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{workoutDays}</div>
              <div className={styles.summaryLabel}>Sessions</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>8</div>
              <div className={styles.summaryLabel}>Target Hrs</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
