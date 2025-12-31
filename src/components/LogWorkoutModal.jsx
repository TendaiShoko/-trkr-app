import { useState } from 'react'
import { useStore } from '../lib/store'
import styles from './Modal.module.css'

const sports = [
  { id: 'swim', icon: '🏊', label: 'Swim' },
  { id: 'bike', icon: '🚴', label: 'Bike' },
  { id: 'run', icon: '🏃', label: 'Run' },
  { id: 'strength', icon: '💪', label: 'Strength' },
  { id: 'other', icon: '🧘', label: 'Other' },
]

const environments = {
  swim: [
    { id: 'pool', icon: '🏊', label: 'Pool' },
    { id: 'open', icon: '🌊', label: 'Open Water' },
  ],
  bike: [
    { id: 'outdoor', icon: '🛤️', label: 'Outdoor' },
    { id: 'indoor', icon: '🏠', label: 'Indoor' },
  ],
  run: [
    { id: 'road', icon: '🛤️', label: 'Road' },
    { id: 'trail', icon: '🌲', label: 'Trail' },
    { id: 'treadmill', icon: '🏠', label: 'Treadmill' },
  ],
  strength: [
    { id: 'upper', icon: '💪', label: 'Upper' },
    { id: 'lower', icon: '🦵', label: 'Lower' },
    { id: 'full', icon: '🏋️', label: 'Full Body' },
  ],
  other: [
    { id: 'yoga', icon: '🧘', label: 'Yoga' },
    { id: 'stretch', icon: '🤸', label: 'Stretch' },
    { id: 'other', icon: '⭐', label: 'Other' },
  ],
}

export default function LogWorkoutModal({ onClose, onSave }) {
  const { currentDate, addWorkout } = useStore()
  
  const [sport, setSport] = useState('run')
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [environment, setEnvironment] = useState('road')
  const [notes, setNotes] = useState('')
  
  const handleSportChange = (newSport) => {
    setSport(newSport)
    setEnvironment(environments[newSport][0].id)
  }
  
  const parseDuration = (str) => {
    if (!str) return 0
    if (str.includes(':')) {
      const [mins, secs] = str.split(':').map(Number)
      return mins + (secs || 0) / 60
    }
    return Number(str) || 0
  }
  
  const handleSubmit = async () => {
    const durationMins = parseDuration(duration)
    if (!durationMins) return
    
    await addWorkout({
      date: currentDate,
      sport,
      name: name || sport,
      duration_minutes: Math.round(durationMins),
      distance: distance ? Number(distance) : null,
      environment,
      notes,
    })
    
    onSave()
  }
  
  const showDistance = ['swim', 'bike', 'run'].includes(sport)
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Log Workout</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Sport</label>
            <div className={styles.sportSelector}>
              {sports.map(s => (
                <button
                  key={s.id}
                  className={`${styles.sportItem} ${sport === s.id ? styles.active : ''}`}
                  onClick={() => handleSportChange(s.id)}
                >
                  <span className={styles.selectorIcon}>{s.icon}</span>
                  <span className={styles.selectorLabel}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Workout Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder={`e.g., Morning ${sport}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Duration (mins)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            {showDistance && (
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Distance ({sport === 'swim' ? 'm' : 'km'})
                </label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder={sport === 'swim' ? '1500' : '5.0'}
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {sport === 'strength' ? 'Focus' : 'Environment'}
            </label>
            <div className={styles.selector}>
              {environments[sport].map(env => (
                <button
                  key={env.id}
                  className={`${styles.selectorItem} ${environment === env.id ? styles.active : ''}`}
                  onClick={() => setEnvironment(env.id)}
                >
                  <span className={styles.selectorIcon}>{env.icon}</span>
                  <span className={styles.selectorLabel}>{env.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Notes (optional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="How did it feel?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <button 
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!duration}
          >
            Save Workout
          </button>
        </div>
      </div>
    </div>
  )
}
