import { useState } from 'react'
import { useStore } from '../lib/store'
import { searchFood } from '../lib/foodApi'
import styles from './Modal.module.css'

const meals = [
  { id: 'breakfast', icon: '🌅', label: 'Breakfast' },
  { id: 'lunch', icon: '☀️', label: 'Lunch' },
  { id: 'dinner', icon: '🌙', label: 'Dinner' },
  { id: 'snack', icon: '🍎', label: 'Snack' },
]

export default function LogFoodModal({ onClose, onSave }) {
  const { currentDate, addFoodEntry, recentFoods } = useStore()
  
  const [meal, setMeal] = useState('breakfast')
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('serving')
  const [quickAdd, setQuickAdd] = useState(false)
  
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showRecent, setShowRecent] = useState(true)
  
  const handleSearch = async (query) => {
    setFoodName(query)
    setShowRecent(false)
    
    if (query.length < 2) {
      setSearchResults([])
      setShowRecent(true)
      return
    }
    
    setSearching(true)
    const results = await searchFood(query)
    setSearchResults(results)
    setSearching(false)
  }
  
  const handleSelectFood = (food) => {
    setFoodName(food.name)
    setCalories(food.calories.toString())
    setProtein(food.protein.toString())
    setCarbs(food.carbs.toString())
    setFat(food.fat.toString())
    setSearchResults([])
    setShowRecent(false)
  }
  
  const handleSelectRecent = (food) => {
    setFoodName(food.food_name)
    setCalories(food.calories?.toString() || '')
    setProtein(food.protein?.toString() || '')
    setCarbs(food.carbs?.toString() || '')
    setFat(food.fat?.toString() || '')
    setUnit(food.unit || 'serving')
    setShowRecent(false)
  }
  
  const handleSubmit = async () => {
    if (!foodName || !calories) return
    
    await addFoodEntry({
      date: currentDate,
      meal,
      food_name: foodName,
      calories: Number(calories),
      protein: quickAdd ? null : Number(protein) || 0,
      carbs: quickAdd ? null : Number(carbs) || 0,
      fat: quickAdd ? null : Number(fat) || 0,
      quantity: Number(quantity) || 1,
      unit,
    })
    
    onSave()
  }
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Log Food</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Meal</label>
            <div className={styles.selector}>
              {meals.map(m => (
                <button
                  key={m.id}
                  className={`${styles.selectorItem} ${meal === m.id ? styles.active : ''}`}
                  onClick={() => setMeal(m.id)}
                >
                  <span className={styles.selectorIcon}>{m.icon}</span>
                  <span className={styles.selectorLabel}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Food Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Search or enter food name..."
              value={foodName}
              onChange={(e) => handleSearch(e.target.value)}
            />
            
            {searching && <div className={styles.searching}>Searching...</div>}
            
            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.slice(0, 5).map(food => (
                  <button
                    key={food.id}
                    className={styles.searchItem}
                    onClick={() => handleSelectFood(food)}
                  >
                    <div className={styles.searchName}>
                      {food.name}
                      {food.brand && <span className={styles.searchBrand}> · {food.brand}</span>}
                    </div>
                    <div className={styles.searchCals}>{food.calories} kcal/100g</div>
                  </button>
                ))}
              </div>
            )}
            
            {showRecent && recentFoods.length > 0 && (
              <div className={styles.recentFoods}>
                <div className={styles.recentTitle}>Recent</div>
                {recentFoods.slice(0, 5).map((food, i) => (
                  <button
                    key={i}
                    className={styles.searchItem}
                    onClick={() => handleSelectRecent(food)}
                  >
                    <div className={styles.searchName}>{food.food_name}</div>
                    <div className={styles.searchCals}>{food.calories} kcal</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>Quick add (calories only)</span>
            <button 
              className={`${styles.toggle} ${quickAdd ? styles.active : ''}`}
              onClick={() => setQuickAdd(!quickAdd)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Calories</label>
            <input
              type="number"
              className={styles.input}
              placeholder="e.g., 350"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>
          
          {!quickAdd && (
            <div className={styles.formRow3}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Protein (g)</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Carbs (g)</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Fat (g)</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Quantity</label>
              <input
                type="number"
                className={styles.input}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Unit</label>
              <select
                className={styles.input}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="serving">serving</option>
                <option value="g">grams</option>
                <option value="ml">ml</option>
                <option value="piece">piece</option>
              </select>
            </div>
          </div>
          
          <button 
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!foodName || !calories}
          >
            Save Food
          </button>
        </div>
      </div>
    </div>
  )
}
