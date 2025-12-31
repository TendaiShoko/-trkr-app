import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import PageHeader from '../components/PageHeader'
import styles from './Settings.module.css'

export default function Settings({ onShowAuth, showToast }) {
  const { user, profile, setProfile, setUser } = useStore()
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    showToast('Signed out')
  }
  
  const handleExport = () => {
    const data = localStorage.getItem('trkr-storage')
    if (data) {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trkr-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Data exported!')
    }
  }
  
  const handleClearData = () => {
    if (window.confirm('Are you sure? This will delete all your local data.')) {
      localStorage.removeItem('trkr-storage')
      window.location.reload()
    }
  }
  
  return (
    <div className={styles.page}>
      <PageHeader title="Settings" />
      
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Account</div>
        
        {user ? (
          <div className={styles.accountCard}>
            <div className={styles.accountInfo}>
              <div className={styles.accountEmail}>{user.email}</div>
              <div className={styles.accountStatus}>Synced to cloud</div>
            </div>
            <button className={styles.signOutBtn} onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        ) : (
          <button className={styles.signInBtn} onClick={onShowAuth}>
            Sign in to sync across devices
          </button>
        )}
      </section>
      
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Profile</div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Name</label>
          <input
            type="text"
            className={styles.input}
            value={profile.name}
            onChange={(e) => setProfile({ name: e.target.value })}
            placeholder="Your name"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Daily Calorie Target</label>
          <input
            type="number"
            className={styles.input}
            value={profile.dailyCalorieTarget}
            onChange={(e) => setProfile({ dailyCalorieTarget: Number(e.target.value) })}
            placeholder="e.g., 2000"
          />
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Protein (g)</label>
            <input
              type="number"
              className={styles.input}
              value={profile.proteinTarget}
              onChange={(e) => setProfile({ proteinTarget: Number(e.target.value) })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Carbs (g)</label>
            <input
              type="number"
              className={styles.input}
              value={profile.carbsTarget}
              onChange={(e) => setProfile({ carbsTarget: Number(e.target.value) })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Fat (g)</label>
            <input
              type="number"
              className={styles.input}
              value={profile.fatTarget}
              onChange={(e) => setProfile({ fatTarget: Number(e.target.value) })}
            />
          </div>
        </div>
      </section>
      
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Data</div>
        
        <button className={styles.dataBtn} onClick={handleExport}>
          <span>📤</span>
          Export All Data (JSON)
        </button>
        
        <button className={`${styles.dataBtn} ${styles.danger}`} onClick={handleClearData}>
          <span>🗑️</span>
          Clear All Local Data
        </button>
      </section>
      
      <section className={styles.section}>
        <div className={styles.about}>
          <div className={styles.logo}>TRKR</div>
          <div className={styles.version}>Version 1.0.0</div>
          <div className={styles.tagline}>Your personal fitness companion</div>
          <div className={styles.credit}>Created by Tendai — www.cognitoai.co.za </div>
        </div>
      </section>
    </div>
  )
}
