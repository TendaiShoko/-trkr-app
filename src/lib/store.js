import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

export const useStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      profile: {
        name: '',
        dailyCalorieTarget: 2000,
        proteinTarget: 150,
        carbsTarget: 250,
        fatTarget: 65,
      },
      
      // Data
      workouts: [],
      foodEntries: [],
      weightEntries: [],
      waterIntake: [],
      recentFoods: [],
      
      // UI state
      currentDate: new Date().toISOString().split('T')[0],
      isOnline: navigator.onLine,
      syncPending: false,
      
      // Actions
      setUser: (user) => set({ user }),
      
      setProfile: (profile) => set({ profile: { ...get().profile, ...profile } }),
      
      setCurrentDate: (date) => set({ currentDate: date }),
      
      // Workouts
      addWorkout: async (workout) => {
        const newWorkout = {
          ...workout,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        }
        
        set((state) => ({
          workouts: [...state.workouts, newWorkout],
        }))
        
        // Sync to Supabase if online
        if (get().user && navigator.onLine) {
          try {
            await supabase.from('workouts').insert({
              ...newWorkout,
              user_id: get().user.id,
            })
          } catch (error) {
            console.error('Failed to sync workout:', error)
            set({ syncPending: true })
          }
        }
        
        return newWorkout
      },
      
      updateWorkout: async (id, updates) => {
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }))
        
        if (get().user && navigator.onLine) {
          try {
            await supabase.from('workouts').update(updates).eq('id', id)
          } catch (error) {
            console.error('Failed to update workout:', error)
          }
        }
      },
      
      deleteWorkout: async (id) => {
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        }))
        
        if (get().user && navigator.onLine) {
          try {
            await supabase.from('workouts').delete().eq('id', id)
          } catch (error) {
            console.error('Failed to delete workout:', error)
          }
        }
      },
      
      // Food entries
      addFoodEntry: async (entry) => {
        const newEntry = {
          ...entry,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        }
        
        set((state) => ({
          foodEntries: [...state.foodEntries, newEntry],
        }))
        
        // Add to recent foods if not already there
        const recentFoods = get().recentFoods
        const existingIndex = recentFoods.findIndex(
          (f) => f.food_name.toLowerCase() === entry.food_name.toLowerCase()
        )
        
        if (existingIndex === -1) {
          set((state) => ({
            recentFoods: [
              {
                food_name: entry.food_name,
                calories: entry.calories,
                protein: entry.protein,
                carbs: entry.carbs,
                fat: entry.fat,
                unit: entry.unit,
              },
              ...state.recentFoods.slice(0, 19), // Keep last 20
            ],
          }))
        }
        
        if (get().user && navigator.onLine) {
          try {
            await supabase.from('food_entries').insert({
              ...newEntry,
              user_id: get().user.id,
            })
          } catch (error) {
            console.error('Failed to sync food entry:', error)
            set({ syncPending: true })
          }
        }
        
        return newEntry
      },
      
      updateFoodEntry: async (id, updates) => {
        set((state) => ({
          foodEntries: state.foodEntries.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        }))
        
        if (get().user && navigator.onLine) {
          try {
            await supabase.from('food_entries').update(updates).eq('id', id)
          } catch (error) {
            console.error('Failed to update food entry:', error)
          }
        }
      },
      
      deleteFoodEntry: async (id) => {
        set((state) => ({
          foodEntries: state.foodEntries.filter((f) => f.id !== id),
        }))
        
        if (get().user && navigator.onLine) {
          try {
            await supabase.from('food_entries').delete().eq('id', id)
          } catch (error) {
            console.error('Failed to delete food entry:', error)
          }
        }
      },
      
      // Weight entries
      addWeightEntry: async (entry) => {
        const newEntry = {
          ...entry,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        }
        
        set((state) => ({
          weightEntries: [...state.weightEntries, newEntry],
        }))
        
        if (get().user && navigator.onLine) {
          try {
            await supabase.from('weight_entries').insert({
              ...newEntry,
              user_id: get().user.id,
            })
          } catch (error) {
            console.error('Failed to sync weight entry:', error)
            set({ syncPending: true })
          }
        }
        
        return newEntry
      },
      
      deleteWeightEntry: async (id) => {
        set((state) => ({
          weightEntries: state.weightEntries.filter((w) => w.id !== id),
        }))
        
        if (get().user && navigator.onLine) {
          try {
            await supabase.from('weight_entries').delete().eq('id', id)
          } catch (error) {
            console.error('Failed to delete weight entry:', error)
          }
        }
      },
      
      // Water intake
      addWater: async (amount) => {
        const today = new Date().toISOString().split('T')[0]
        const existingEntry = get().waterIntake.find((w) => w.date === today)
        
        if (existingEntry) {
          set((state) => ({
            waterIntake: state.waterIntake.map((w) =>
              w.date === today ? { ...w, amount: w.amount + amount } : w
            ),
          }))
        } else {
          set((state) => ({
            waterIntake: [
              ...state.waterIntake,
              { id: crypto.randomUUID(), date: today, amount },
            ],
          }))
        }
      },
      
      resetWater: () => {
        const today = new Date().toISOString().split('T')[0]
        set((state) => ({
          waterIntake: state.waterIntake.filter((w) => w.date !== today),
        }))
      },
      
      // Sync from Supabase
      syncFromCloud: async () => {
        const user = get().user
        if (!user) return
        
        try {
          const [workoutsRes, foodRes, weightRes] = await Promise.all([
            supabase.from('workouts').select('*').eq('user_id', user.id),
            supabase.from('food_entries').select('*').eq('user_id', user.id),
            supabase.from('weight_entries').select('*').eq('user_id', user.id),
          ])
          
          if (workoutsRes.data) set({ workouts: workoutsRes.data })
          if (foodRes.data) set({ foodEntries: foodRes.data })
          if (weightRes.data) set({ weightEntries: weightRes.data })
          
          set({ syncPending: false })
        } catch (error) {
          console.error('Failed to sync from cloud:', error)
        }
      },
      
      // Helpers
      getTodayStats: () => {
        const today = get().currentDate
        const foodEntries = get().foodEntries.filter((f) => f.date === today)
        const workouts = get().workouts.filter((w) => w.date === today)
        const weight = get().weightEntries.find((w) => w.date === today)
        const water = get().waterIntake.find((w) => w.date === today)
        
        const totals = foodEntries.reduce(
          (acc, entry) => ({
            calories: acc.calories + (entry.calories || 0) * (entry.quantity || 1),
            protein: acc.protein + (entry.protein || 0) * (entry.quantity || 1),
            carbs: acc.carbs + (entry.carbs || 0) * (entry.quantity || 1),
            fat: acc.fat + (entry.fat || 0) * (entry.quantity || 1),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )
        
        return {
          ...totals,
          workoutCount: workouts.length,
          workoutMinutes: workouts.reduce((acc, w) => acc + (w.duration_minutes || 0), 0),
          weight: weight?.weight_kg || null,
          water: water?.amount || 0,
        }
      },
      
      getWeekStats: () => {
        const today = new Date(get().currentDate)
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
        
        const stats = []
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart)
          date.setDate(weekStart.getDate() + i)
          const dateStr = date.toISOString().split('T')[0]
          
          const dayFood = get().foodEntries.filter((f) => f.date === dateStr)
          const dayWorkouts = get().workouts.filter((w) => w.date === dateStr)
          const dayWeight = get().weightEntries.find((w) => w.date === dateStr)
          
          stats.push({
            date: dateStr,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            calories: dayFood.reduce((acc, f) => acc + (f.calories || 0) * (f.quantity || 1), 0),
            workoutMinutes: dayWorkouts.reduce((acc, w) => acc + (w.duration_minutes || 0), 0),
            weight: dayWeight?.weight_kg || null,
          })
        }
        
        return stats
      },
      
      getFoodByMeal: (date) => {
        const entries = get().foodEntries.filter((f) => f.date === date)
        return {
          breakfast: entries.filter((f) => f.meal === 'breakfast'),
          lunch: entries.filter((f) => f.meal === 'lunch'),
          dinner: entries.filter((f) => f.meal === 'dinner'),
          snack: entries.filter((f) => f.meal === 'snack'),
        }
      },
      
      getLatestWeight: () => {
        const weights = [...get().weightEntries].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )
        return weights[0] || null
      },
      
      getWeightTrend: (days = 30) => {
        const weights = [...get().weightEntries]
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-days)
        return weights
      },
    }),
    {
      name: 'trkr-storage',
      partialize: (state) => ({
        profile: state.profile,
        workouts: state.workouts,
        foodEntries: state.foodEntries,
        weightEntries: state.weightEntries,
        waterIntake: state.waterIntake,
        recentFoods: state.recentFoods,
      }),
    }
  )
)
