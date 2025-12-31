import styles from './FoodLog.module.css'

const mealInfo = {
  breakfast: { emoji: '🌅', label: 'Breakfast' },
  lunch: { emoji: '☀️', label: 'Lunch' },
  dinner: { emoji: '🌙', label: 'Dinner' },
  snack: { emoji: '🍎', label: 'Snacks' },
}

export default function FoodLog({ meals, onAddFood }) {
  const hasMeals = Object.values(meals).some(m => m.length > 0)
  
  if (!hasMeals) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🍽️</span>
        <p>No food logged today</p>
        <button className={styles.addBtn} onClick={onAddFood}>
          Log your first meal
        </button>
      </div>
    )
  }
  
  return (
    <div className={styles.container}>
      {Object.entries(meals).map(([mealType, foods]) => {
        if (foods.length === 0) return null
        
        const totalCals = foods.reduce((acc, f) => acc + (f.calories || 0) * (f.quantity || 1), 0)
        const info = mealInfo[mealType]
        
        return (
          <div key={mealType} className={styles.mealGroup}>
            <div className={styles.mealHeader}>
              <div className={styles.mealTitle}>
                <span className={styles.mealEmoji}>{info.emoji}</span>
                {info.label}
              </div>
              <div className={styles.mealCals}>{totalCals} kcal</div>
            </div>
            
            {foods.map(food => (
              <div key={food.id} className={styles.foodItem}>
                <div className={styles.foodInfo}>
                  <span className={styles.foodName}>{food.food_name}</span>
                  {food.quantity > 1 && (
                    <span className={styles.foodQty}>× {food.quantity}</span>
                  )}
                </div>
                <span className={styles.foodCals}>{(food.calories || 0) * (food.quantity || 1)} kcal</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
