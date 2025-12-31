import { useState } from 'react'
import { useStore } from '../lib/store'
import PageHeader from '../components/PageHeader'
import styles from './Goals.module.css'

const activityLevels = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { id: 'light', label: 'Light', desc: '1-3 days/week' },
  { id: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
  { id: 'active', label: 'Active', desc: '6-7 days/week' },
  { id: 'athlete', label: 'Athlete', desc: '2x/day training' },
]

const goalPaces = [
  { id: 'slow', label: 'Slow', desc: '0.25 kg/week' },
  { id: 'moderate', label: 'Moderate', desc: '0.5 kg/week' },
  { id: 'aggressive', label: 'Aggressive', desc: '0.75 kg/week' },
]

export default function Goals({ onBack, showToast }) {
  const { profile, setProfile, getGoalProgress, getLatestWeight } = useStore()
  const [showCalculator, setShowCalculator] = useState(profile.useCalculatedCalories)
  
  const goalProgress = getGoalProgress()
  const latestWeight = getLatestWeight()
  
  const handleToggleCalculator = (enabled) => {
    setShowCalculator(enabled)
    setProfile({ useCalculatedCalories: enabled })
  }
  
  const handleSave = () => {
    showToast('Goals updated!')
  }
  
  // Calculate weeks to goal
  const weeksToGoal = () => {
    if (!profile.targetWeight || !profile.currentWeight) return null
    const diff = Math.abs(profile.currentWeight - profile.targetWeight)
    const pacePerWeek = { slow: 0.25, moderate: 0.5, aggressive: 0.75 }
    const weeks = Math.ceil(diff / pacePerWeek[profile.goalPace || 'moderate'])
    return weeks
  }
  
  const weeks = weeksToGoal()
  
  return (
    <div className={styles.page}>
      <PageHeader title="Goals" onBack={onBack} />
      
      {/* Progress Overview */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Your Progress</div>
        
        <div className={styles.progressCards}>
          {profile.targetWeight && (
            <div className={styles.progressCard}>
              <div className={styles.progressIcon}>⚖️</div>
              <div className={styles.progressInfo}>
                <div className={styles.progressLabel}>Weight Goal</div>
                <div className={styles.progressValue}>
                  {goalProgress.currentWeight || '--'} → {profile.targetWeight} kg
                </div>
                {goalProgress.weightProgress !== null && (
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${Math.min(Math.max(goalProgress.weightProgress, 0), 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {profile.weeklyWorkoutTarget && (
            <div className={styles.progressCard}>
              <div className={styles.progressIcon}>🏋️</div>
              <div className={styles.progressInfo}>
                <div className={styles.progressLabel}>Weekly Workouts</div>
                <div className={styles.progressValue}>
                  {goalProgress.weekWorkouts} / {profile.weeklyWorkoutTarget}
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${styles.workout}`}
                    style={{ width: `${Math.min(goalProgress.workoutProgress || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Body Stats for Calorie Calculation */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Body Stats</div>
        <p className={styles.sectionDesc}>Used to calculate your recommended daily calories</p>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Current Weight (kg)</label>
            <input
              type="number"
              className={styles.input}
              value={profile.currentWeight || ''}
              onChange={(e) => setProfile({ currentWeight: Number(e.target.value) || null })}
              placeholder="e.g., 80"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Height (cm)</label>
            <input
              type="number"
              className={styles.input}
              value={profile.height || ''}
              onChange={(e) => setProfile({ height: Number(e.target.value) || null })}
              placeholder="e.g., 175"
            />
          </div>
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Age</label>
            <input
              type="number"
              className={styles.input}
              value={profile.age || ''}
              onChange={(e) => setProfile({ age: Number(e.target.value) || null })}
              placeholder="e.g., 30"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Gender</label>
            <select
              className={styles.input}
              value={profile.gender || ''}
              onChange={(e) => setProfile({ gender: e.target.value || null })}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </section>
      
      {/* Weight Goal */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Weight Goal</div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Target Weight (kg)</label>
          <input
            type="number"
            className={styles.input}
            value={profile.targetWeight || ''}
            onChange={(e) => setProfile({ targetWeight: Number(e.target.value) || null })}
            placeholder="e.g., 75"
          />
        </div>
        
        {profile.targetWeight && profile.currentWeight && (
          <div className={styles.goalSummary}>
            {profile.targetWeight < profile.currentWeight ? (
              <span>Lose {(profile.currentWeight - profile.targetWeight).toFixed(1)} kg</span>
            ) : profile.targetWeight > profile.currentWeight ? (
              <span>Gain {(profile.targetWeight - profile.currentWeight).toFixed(1)} kg</span>
            ) : (
              <span>Maintain current weight</span>
            )}
            {weeks && <span className={styles.weeksEstimate}> · ~{weeks} weeks</span>}
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Goal Pace</label>
          <div className={styles.optionGrid}>
            {goalPaces.map(pace => (
              <button
                key={pace.id}
                className={`${styles.optionCard} ${profile.goalPace === pace.id ? styles.active : ''}`}
                onClick={() => setProfile({ goalPace: pace.id })}
              >
                <div className={styles.optionLabel}>{pace.label}</div>
                <div className={styles.optionDesc}>{pace.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Activity Level */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Activity Level</div>
        
        <div className={styles.optionList}>
          {activityLevels.map(level => (
            <button
              key={level.id}
              className={`${styles.optionRow} ${profile.activityLevel === level.id ? styles.active : ''}`}
              onClick={() => setProfile({ activityLevel: level.id })}
            >
              <div className={styles.optionLabel}>{level.label}</div>
              <div className={styles.optionDesc}>{level.desc}</div>
              {profile.activityLevel === level.id && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      </section>
      
      {/* Calorie Target */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Daily Calories</div>
        
        <div className={styles.toggleRow}>
          <div>
            <div className={styles.toggleLabel}>Auto-calculate calories</div>
            <div className={styles.toggleDesc}>Based on your stats and goals</div>
          </div>
          <button 
            className={`${styles.toggle} ${showCalculator ? styles.active : ''}`}
            onClick={() => handleToggleCalculator(!showCalculator)}
          />
        </div>
        
        {showCalculator ? (
          <div className={styles.calculatedCalories}>
            <div className={styles.calorieValue}>{profile.dailyCalorieTarget}</div>
            <div className={styles.calorieLabel}>kcal / day (calculated)</div>
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label className={styles.label}>Manual Calorie Target</label>
            <input
              type="number"
              className={styles.input}
              value={profile.dailyCalorieTarget}
              onChange={(e) => setProfile({ dailyCalorieTarget: Number(e.target.value) })}
              placeholder="e.g., 2000"
            />
          </div>
        )}
      </section>
      
      {/* Workout Frequency */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Workout Frequency</div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Weekly Workout Target</label>
          <div className={styles.frequencySelector}>
            {[3, 4, 5, 6, 7].map(num => (
              <button
                key={num}
                className={`${styles.frequencyBtn} ${profile.weeklyWorkoutTarget === num ? styles.active : ''}`}
                onClick={() => setProfile({ weeklyWorkoutTarget: num })}
              >
                {num}
              </button>
            ))}
          </div>
          <div className={styles.frequencyLabel}>workouts per week</div>
        </div>
      </section>
      
      <button className={styles.saveBtn} onClick={handleSave}>
        Save Goals
      </button>
    </div>
  )
}
