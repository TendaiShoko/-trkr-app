import { useState } from 'react'
import { useStore } from '../lib/store'
import styles from './QuickLog.module.css'

const meals = [
  { id: 'breakfast', icon: '🌅', label: 'Breakfast' },
  { id: 'lunch', icon: '☀️', label: 'Lunch' },
  { id: 'dinner', icon: '🌙', label: 'Dinner' },
  { id: 'snack', icon: '🍎', label: 'Snack' },
]

const sportIcons = {
  swim: '🏊',
  bike: '🚴',
  run: '🏃',
  strength: '💪',
  other: '🧘',
}

export default function QuickLog({ onClose, showToast }) {
  const { recentFoods, workoutTemplates, quickLogFood, logFromTemplate } = useStore()
  const [tab, setTab] = useState('food')
  const [selectedMeal, setSelectedMeal] = useState('snack')
  const [logging, setLogging] = useState(null)
  
  const handleQuickLogFood = async (food) => {
    setLogging(food.food_name)
    await quickLogFood(food, selectedMeal)
    showToast(`Added ${food.food_name} ✓`)
    setLogging(null)
  }
  
  const handleLogTemplate = async (templateId) => {
    setLogging(templateId)
    const workout = await logFromTemplate(templateId)
    if (workout) {
      showToast(`Logged ${workout.name} ✓`)
    }
    setLogging(null)
  }
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Quick Log</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${tab === 'food' ? styles.active : ''}`}
            onClick={() => setTab('food')}
          >
            🍽️ Recent Foods
          </button>
          <button 
            className={`${styles.tab} ${tab === 'workout' ? styles.active : ''}`}
            onClick={() => setTab('workout')}
          >
            🏋️ Templates
          </button>
        </div>
        
        <div className={styles.body}>
          {tab === 'food' && (
            <>
              <div className={styles.mealSelector}>
                <span className={styles.mealLabel}>Add to:</span>
                {meals.map(m => (
                  <button
                    key={m.id}
                    className={`${styles.mealBtn} ${selectedMeal === m.id ? styles.active : ''}`}
                    onClick={() => setSelectedMeal(m.id)}
                  >
                    {m.icon}
                  </button>
                ))}
              </div>
              
              {recentFoods.length > 0 ? (
                <div className={styles.list}>
                  {recentFoods.slice(0, 10).map((food, i) => (
                    <button
                      key={i}
                      className={styles.item}
                      onClick={() => handleQuickLogFood(food)}
                      disabled={logging === food.food_name}
                    >
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{food.food_name}</div>
                        <div className={styles.itemMeta}>
                          {food.calories} kcal
                          {food.protein && ` · P: ${food.protein}g`}
                        </div>
                      </div>
                      <div className={styles.addIcon}>
                        {logging === food.food_name ? '...' : '+'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <span>🍽️</span>
                  <p>No recent foods yet</p>
                  <p className={styles.emptyHint}>Log some food and it will appear here</p>
                </div>
              )}
            </>
          )}
          
          {tab === 'workout' && (
            <>
              {workoutTemplates.length > 0 ? (
                <div className={styles.list}>
                  {workoutTemplates.map(template => (
                    <button
                      key={template.id}
                      className={styles.item}
                      onClick={() => handleLogTemplate(template.id)}
                      disabled={logging === template.id}
                    >
                      <div className={`${styles.templateIcon} ${styles[template.sport]}`}>
                        {sportIcons[template.sport]}
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{template.name}</div>
                        <div className={styles.itemMeta}>
                          {template.duration_minutes} min
                          {template.distance && ` · ${template.distance} ${template.sport === 'swim' ? 'm' : 'km'}`}
                        </div>
                      </div>
                      <div className={styles.addIcon}>
                        {logging === template.id ? '...' : '+'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <span>🏋️</span>
                  <p>No workout templates yet</p>
                  <p className={styles.emptyHint}>Create templates from the workout log screen</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
