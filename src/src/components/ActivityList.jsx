import { useState } from 'react'
import { format } from 'date-fns'
import { useStore } from '../lib/store'
import styles from './ActivityList.module.css'

const sportIcons = {
  swim: '🏊',
  bike: '🚴',
  run: '🏃',
  strength: '💪',
  other: '🧘',
}

export default function ActivityList({ workouts, showToast }) {
  const { deleteWorkout } = useStore()
  const [expandedItem, setExpandedItem] = useState(null)
  const [deleting, setDeleting] = useState(null)
  
  if (workouts.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🏋️</span>
        <p>No workouts yet</p>
      </div>
    )
  }
  
  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}`
    }
    return `${mins}:00`
  }
  
  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await deleteWorkout(id)
      showToast?.('Workout deleted')
    } catch (error) {
      showToast?.('Failed to delete', 'error')
    }
    setDeleting(null)
    setExpandedItem(null)
  }
  
  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id)
  }
  
  return (
    <div className={styles.list}>
      {workouts.map((workout, index) => (
        <div 
          key={workout.id} 
          className={styles.itemWrapper}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div 
            className={styles.item}
            onClick={() => toggleExpand(workout.id)}
          >
            <div className={`${styles.icon} ${styles[workout.sport]}`}>
              {sportIcons[workout.sport] || '🏃'}
            </div>
            <div className={styles.info}>
              <div className={styles.name}>{workout.name || workout.sport}</div>
              <div className={styles.meta}>
                {format(new Date(workout.date), 'MMM d')} · {workout.environment || 'Workout'}
              </div>
            </div>
            <div className={styles.stats}>
              <div className={styles.duration}>{formatDuration(workout.duration_minutes)}</div>
              <div className={styles.distance}>
                {workout.distance ? `${workout.distance} ${workout.sport === 'swim' ? 'm' : 'km'}` : workout.sport}
              </div>
            </div>
          </div>
          
          {expandedItem === workout.id && (
            <div className={styles.actions}>
              {workout.notes && (
                <div className={styles.notes}>📝 {workout.notes}</div>
              )}
              <button 
                className={styles.deleteBtn}
                onClick={() => handleDelete(workout.id)}
                disabled={deleting === workout.id}
              >
                {deleting === workout.id ? 'Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
