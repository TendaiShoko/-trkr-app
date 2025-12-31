import { useStore } from '../lib/store'
import { format } from 'date-fns'
import Header from '../components/Header'
import CalorieCard from '../components/CalorieCard'
import StatsCard from '../components/StatsCard'
import ActivityList from '../components/ActivityList'
import FoodLog from '../components/FoodLog'
import WaterTracker from '../components/WaterTracker'
import styles from './Home.module.css'

export default function Home({ onOpenModal, showToast }) {
  const { profile, currentDate, getTodayStats, getLatestWeight, workouts, foodEntries } = useStore()
  
  const todayStats = getTodayStats()
  const latestWeight = getLatestWeight()
  
  // Get recent workouts (last 5)
  const recentWorkouts = [...workouts]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
  
  // Get today's food by meal
  const todayFood = foodEntries.filter(f => f.date === currentDate)
  const foodByMeal = {
    breakfast: todayFood.filter(f => f.meal === 'breakfast'),
    lunch: todayFood.filter(f => f.meal === 'lunch'),
    dinner: todayFood.filter(f => f.meal === 'dinner'),
    snack: todayFood.filter(f => f.meal === 'snack'),
  }
  
  // Get week workout count
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1)
  const weekWorkouts = workouts.filter(w => new Date(w.date) >= weekStart).length
  
  // Greeting based on time
  const hour = new Date().getHours()
  let greeting = 'Good morning'
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
  else if (hour >= 17) greeting = 'Good evening'
  
  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.greeting}>
        <p className={styles.greetingText}>{greeting}</p>
        <h1 className={styles.greetingName}>{profile.name || 'There'}</h1>
      </div>
      
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Today's Progress</span>
          <span className={styles.dateBadge}>{format(new Date(currentDate), 'MMM d')}</span>
        </div>
        
        <CalorieCard 
          calories={todayStats.calories}
          target={profile.dailyCalorieTarget}
          protein={todayStats.protein}
          carbs={todayStats.carbs}
          fat={todayStats.fat}
          proteinTarget={profile.proteinTarget}
          carbsTarget={profile.carbsTarget}
          fatTarget={profile.fatTarget}
        />
        
        <div className={styles.statsRow}>
          <StatsCard
            icon="weight"
            value={latestWeight?.weight_kg || '--'}
            label="kg today"
            change={null}
            trend="down"
          />
          <StatsCard
            icon="workout"
            value={todayStats.workoutCount}
            label="workouts today"
            change={`${weekWorkouts} this week`}
            trend="up"
          />
        </div>
      </section>
      
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Water</span>
        </div>
        <WaterTracker showToast={showToast} />
      </section>
      
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Today's Food</span>
          <button className={styles.dateBadge} onClick={() => onOpenModal('food')}>
            + Add
          </button>
        </div>
        <FoodLog meals={foodByMeal} onAddFood={() => onOpenModal('food')} />
      </section>
      
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Recent Activity</span>
          <button className={styles.dateBadge} onClick={() => onOpenModal('workout')}>
            + Add
          </button>
        </div>
        <ActivityList workouts={recentWorkouts} />
      </section>
    </div>
  )
}
