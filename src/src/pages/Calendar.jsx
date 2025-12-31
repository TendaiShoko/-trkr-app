import { useState } from 'react'
import { useStore } from '../lib/store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import PageHeader from '../components/PageHeader'
import styles from './Calendar.module.css'

export default function Calendar({ onOpenModal }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const { workouts, foodEntries, weightEntries, setCurrentDate } = useStore()
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  const getDateDots = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dots = []
    
    if (workouts.some(w => w.date === dateStr)) dots.push('workout')
    if (foodEntries.some(f => f.date === dateStr)) dots.push('food')
    if (weightEntries.some(w => w.date === dateStr)) dots.push('weight')
    
    return dots
  }
  
  const getSelectedDateStats = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    
    const dayFood = foodEntries.filter(f => f.date === dateStr)
    const dayWorkouts = workouts.filter(w => w.date === dateStr)
    const dayWeight = weightEntries.find(w => w.date === dateStr)
    
    const calories = dayFood.reduce((acc, f) => acc + (f.calories || 0) * (f.quantity || 1), 0)
    
    return {
      calories,
      workoutCount: dayWorkouts.length,
      weight: dayWeight?.weight_kg || null,
    }
  }
  
  const stats = getSelectedDateStats()
  
  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }
  
  const handleSelectDate = (date) => {
    setSelectedDate(date)
    setCurrentDate(format(date, 'yyyy-MM-dd'))
  }
  
  return (
    <div className={styles.page}>
      <PageHeader title="Calendar" />
      
      <div className={styles.container}>
        <div className={styles.nav}>
          <button className={styles.arrow} onClick={handlePrevMonth}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className={styles.month}>{format(currentMonth, 'MMMM yyyy')}</div>
          <button className={styles.arrow} onClick={handleNextMonth}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className={styles.weekdays}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className={styles.weekday}>{day}</div>
          ))}
        </div>
        
        <div className={styles.days}>
          {days.map(day => {
            const dots = getDateDots(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected = isSameDay(day, selectedDate)
            const isTodayDate = isToday(day)
            
            return (
              <button
                key={day.toISOString()}
                className={`${styles.day} ${!isCurrentMonth ? styles.otherMonth : ''} ${isSelected ? styles.selected : ''} ${isTodayDate ? styles.today : ''}`}
                onClick={() => handleSelectDate(day)}
              >
                <span className={styles.dayNumber}>{format(day, 'd')}</span>
                {dots.length > 0 && (
                  <div className={styles.dots}>
                    {dots.map(dot => (
                      <span key={dot} className={`${styles.dot} ${styles[dot]}`} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        <div className={styles.summary}>
          <div className={styles.summaryDate}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </div>
          <div className={styles.summaryStats}>
            <div className={styles.summaryStat}>
              <div className={styles.summaryValue}>{stats.calories.toLocaleString()}</div>
              <div className={styles.summaryLabel}>Calories</div>
            </div>
            <div className={styles.summaryStat}>
              <div className={styles.summaryValue}>{stats.workoutCount}</div>
              <div className={styles.summaryLabel}>Workouts</div>
            </div>
            <div className={styles.summaryStat}>
              <div className={styles.summaryValue}>{stats.weight || '--'}</div>
              <div className={styles.summaryLabel}>kg</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
