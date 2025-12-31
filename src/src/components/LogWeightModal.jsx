import { useState } from 'react'
import { useStore } from '../lib/store'
import { format } from 'date-fns'
import styles from './Modal.module.css'

export default function LogWeightModal({ onClose, onSave }) {
  const { currentDate, addWeightEntry } = useStore()
  
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(currentDate)
  const [notes, setNotes] = useState('')
  
  const handleSubmit = async () => {
    if (!weight) return
    
    await addWeightEntry({
      date,
      weight_kg: Number(weight),
      notes,
    })
    
    onSave()
  }
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Log Weight</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Weight (kg)</label>
            <input
              type="number"
              className={styles.weightInput}
              placeholder="78.5"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Date</label>
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Notes (optional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g., Before breakfast, post-run..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <button 
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!weight}
          >
            Save Weight
          </button>
        </div>
      </div>
    </div>
  )
}
