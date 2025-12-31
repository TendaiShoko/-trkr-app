import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

// Calculate BMR using Mifflin-St Jeor equation
const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

// Activity multipliers
const activityMultipliers = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  athlete: 1.9,        // Very hard exercise, physical job, or training 2x/day
}

// Calculate daily calories based on goals
const calculateDailyCalories = (profile) => {
  const { currentWeight, height, age, gender, activityLevel, targetWeight, goalPace } = profile
  
  if (!currentWeight || !height || !age || !gender) return 2000 // Default
  
  const bmr = calculateBMR(currentWeight, height, age, gender)
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55)
  
  // Adjust based on goal
  if (!targetWeight || targetWeight === currentWeight) {
    return Math.round(tdee) // Maintain
  }
  
  // Calorie deficit/surplus based on pace
  // 0.25kg/week = 275 cal deficit, 0.5kg/week = 550 cal, 0.75kg/week = 825 cal
  const paceDeficits = {
    slow: 275,
    moderate: 550,
    aggressive: 825,
  }
  
  const deficit = paceDeficits[goalPace] || 550
  
  if (targetWeight < currentWeight) {
    return Math.round(tdee - deficit) // Lose weight
  } else {
    return Math.round(tdee + deficit) // Gain weight
  }
}

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
        waterTarget: 2000,
        // Goal settings
        currentWeight: null,
        targetWeight: null,
        height: null,       // in cm
        age: null,
        gender: null,       // 'male' or 'female'
        activityLevel: 'moderate', // sedentary, light, moderate, active, athlete
        goalPace: 'moderate',      // slow, moderate, aggressive
        weeklyWorkoutTarget: 5,    // target workouts per week
        useCalculatedCalories: false, // whether to use calculated or manual calories
      },
      
      // Data
      workouts: [],
      foodEntries: [],
      weightEntries: [],
      waterIntake: [],
      recentFoods: [],
      workoutTemplates: [],  // NEW: saved workout templates
      
      // UI state
      currentDate: new Date().toISOString().split('T')[0],
      isOnline: navigator.onLine,
      syncPending: false,
      
      // Actions
      setUser: (user) => set({ user }),
      
      setProfile: (updates) => {
        const newProfile = { ...get().profile, ...updates }
        
        // Auto-calculate calories if enabled
        if (newProfile.useCalculatedCalories) {
          newProfile.dailyCalorieTarget = calculateDailyCalories(newProfile)
        }
        
        set({ profile: newProfile })
      },
      
      // Recalculate calories (call when weight changes)
      recalculateCalories: () => {
        const profile = get().profile
        if (profile.useCalculatedCalories) {
          const newTarget = calculateDailyCalories(profile)
          set({ profile: { ...profile, dailyCalorieTarget: newTarget } })
        }
      },
      
      setCurrentDate: (date) => set({ currentDate: date }),
      
      // Workout Templates
      addWorkoutTemplate: (template) => {
        const newTemplate = {
          ...template,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        }
        set((state) => ({
          workoutTemplates: [...state.workoutTemplates, newTemplate],
        }))
        return newTemplate
      },
      
      deleteWorkoutTemplate: (id) => {
        set((state) => ({
          workoutTemplates: state.workoutTemplates.filter((t) => t.id !== id),
        }))
      },
      
      // Quick log from template
      logFromTemplate: async (templateId) => {
        const template = get().workoutTemplates.find((t) => t.id === templateId)
        if (!template) return null
        
        const workout = {
          sport: template.sport,
          name: template.name,
          duration_minutes: template.duration_minutes,
          distance: template.distance,
          environment: template.environment,
          date: get().currentDate,
        }
        
        return get().addWorkout(workout)
      },
      
      // Quick re-log food
      quickLogFood: async (recentFood, meal) => {
        const entry = {
          date: get().currentDate,
          meal: meal || 'snack',
          food_name: recentFood.food_name,
          calories: recentFood.calories,
          protein: recentFood.protein,
          carbs: recentFood.carbs,
          fat: recentFood.fat,
          quantity: 1,
          unit: recentFood.unit || 'serving',
        }
        return get().addFoodEntry(entry)
      },
      
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
        } else {
          // Move to top if already exists
          const updated = [...recentFoods]
          const [item] = updated.splice(existingIndex, 1)
          updated.unshift(item)
          set({ recentFoods: updated })
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
        
        // Update current weight in profile and recalculate calories
        const profile = get().profile
        if (profile.useCalculatedCalories) {
          const newProfile = { ...profile, currentWeight: entry.weight_kg }
          newProfile.dailyCalorieTarget = calculateDailyCalories(newProfile)
          set({ profile: newProfile })
        }
        
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
      
      getWeekWorkoutCount: () => {
        const today = new Date()
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
        weekStart.setHours(0, 0, 0, 0)
        
        return get().workouts.filter(w => new Date(w.date) >= weekStart).length
      },
      
      getGoalProgress: () => {
        const profile = get().profile
        const latestWeight = get().getLatestWeight()
        const weekWorkouts = get().getWeekWorkoutCount()
        
        // Weight progress
        let weightProgress = null
        if (profile.targetWeight && profile.currentWeight && latestWeight) {
          const totalToLose = profile.currentWeight - profile.targetWeight
          const actualLost = profile.currentWeight - latestWeight.weight_kg
          weightProgress = totalToLose !== 0 ? Math.round((actualLost / totalToLose) * 100) : 100
        }
        
        // Workout progress
        const workoutProgress = profile.weeklyWorkoutTarget 
          ? Math.round((weekWorkouts / profile.weeklyWorkoutTarget) * 100)
          : null
        
        return {
          weightProgress,
          workoutProgress,
          weekWorkouts,
          weeklyWorkoutTarget: profile.weeklyWorkoutTarget,
          currentWeight: latestWeight?.weight_kg || profile.currentWeight,
          targetWeight: profile.targetWeight,
        }
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
        workoutTemplates: state.workoutTemplates,
      }),
    }
  )
)
