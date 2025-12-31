import { useState, useEffect } from 'react'
import { useStore } from './lib/store'
import { supabase } from './lib/supabase'

// Pages
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Trends from './pages/Trends'
import Settings from './pages/Settings'

// Components
import BottomNav from './components/BottomNav'
import AddModal from './components/AddModal'
import LogFoodModal from './components/LogFoodModal'
import LogWorkoutModal from './components/LogWorkoutModal'
import LogWeightModal from './components/LogWeightModal'
import Toast from './components/Toast'
import Auth from './components/Auth'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  
  const { user, setUser, syncFromCloud } = useStore()
  
  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        syncFromCloud()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        syncFromCloud()
      }
    })

    return () => subscription.unsubscribe()
  }, [])
  
  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      showToast('Back online - syncing...')
      syncFromCloud()
    }
    
    const handleOffline = () => {
      showToast('Offline - changes saved locally')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }
  
  const openModal = (modalName) => setModal(modalName)
  const closeModal = () => setModal(null)
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onOpenModal={openModal} showToast={showToast} />
      case 'calendar':
        return <Calendar onOpenModal={openModal} />
      case 'trends':
        return <Trends />
      case 'settings':
        return <Settings onShowAuth={() => setShowAuth(true)} showToast={showToast} />
      default:
        return <Home onOpenModal={openModal} showToast={showToast} />
    }
  }
  
  return (
    <div className="app">
      {renderPage()}
      
      <BottomNav 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onAdd={() => openModal('add')}
      />
      
      {/* Modals */}
      {modal === 'add' && (
        <AddModal 
          onClose={closeModal} 
          onSelect={(type) => {
            closeModal()
            setTimeout(() => openModal(type), 100)
          }}
        />
      )}
      
      {modal === 'food' && (
        <LogFoodModal 
          onClose={closeModal} 
          onSave={() => {
            closeModal()
            showToast('Food logged!')
          }}
        />
      )}
      
      {modal === 'workout' && (
        <LogWorkoutModal 
          onClose={closeModal} 
          onSave={() => {
            closeModal()
            showToast('Workout saved!')
          }}
        />
      )}
      
      {modal === 'weight' && (
        <LogWeightModal 
          onClose={closeModal} 
          onSave={() => {
            closeModal()
            showToast('Weight recorded!')
          }}
        />
      )}
      
      {showAuth && (
        <Auth 
          onClose={() => setShowAuth(false)} 
          onSuccess={() => {
            setShowAuth(false)
            showToast('Signed in successfully!')
          }}
        />
      )}
      
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default App
