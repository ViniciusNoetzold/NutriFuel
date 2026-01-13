import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  UserProfile,
  Recipe,
  MealSlot,
  DayLog,
  MealType,
  Ingredient,
  Notification as AppNotification,
  ShoppingItem,
  ScannedProduct,
} from '@/lib/types'
import { MOCK_USER, MOCK_RECIPES } from '@/lib/data'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

interface AppContextType {
  user: UserProfile
  isAuthenticated: boolean
  login: (username: string, pass: string) => boolean
  logout: () => void
  updateUser: (data: Partial<UserProfile>) => void
  toggleWidget: (widget: string) => void
  recipes: Recipe[]
  addRecipe: (recipe: Recipe) => void
  toggleFavorite: (id: string) => void
  mealPlan: MealSlot[]
  addMealToPlan: (date: string, type: MealType, recipeId: string) => void
  removeMealFromPlan: (date: string, type: MealType) => void
  toggleMealCompletion: (date: string, type: MealType) => void
  autoGeneratePlan: (startDate: string) => void
  dailyLogs: DayLog[]
  logWater: (amount: number, date: string) => void
  logWeight: (weight: number, date: string, photo?: string) => void
  logExercise: (calories: number, date: string) => void
  logSleep: (hours: number, date: string) => void
  shoppingList: ShoppingItem[]
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void
  addIngredientsToShoppingList: (ingredients: Ingredient[]) => void
  toggleShoppingItem: (id: string) => void
  removeShoppingItem: (id: string) => void
  clearShoppingList: () => void
  notifications: AppNotification[]
  markNotificationsAsRead: () => void
  hydrationSettings: { enabled: boolean; sound: boolean }
  toggleHydrationSettings: (setting: 'enabled' | 'sound') => void
  getDailyNutrition: (date: string) => {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
  getConsumedNutrition: (date: string) => {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
  hasNewPR: boolean
  resetPR: () => void
  scannedHistory: ScannedProduct[]
  addScannedProduct: (product: ScannedProduct) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'NutriFuel Grátis',
    message: 'Aproveite todos os recursos desbloqueados!',
    date: new Date().toISOString(),
    read: false,
  },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, signIn, signOut } = useAuth()
  const [user, setUser] = useState<UserProfile>(MOCK_USER)
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES as Recipe[])
  const [mealPlan, setMealPlan] = useState<MealSlot[]>([])
  const [dailyLogs, setDailyLogs] = useState<DayLog[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [notifications, setNotifications] =
    useState<AppNotification[]>(MOCK_NOTIFICATIONS)
  const [hasNewPR, setHasNewPR] = useState(false)
  const [hydrationSettings, setHydrationSettings] = useState({
    enabled: true,
    sound: true,
  })
  const [scannedHistory, setScannedHistory] = useState<ScannedProduct[]>([])

  useEffect(() => {
    if (authUser) {
      // Fetch Profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            // Robustly map data ensuring no null values propagate to UI for critical fields
            setUser((prev) => ({
              ...prev,
              id: data.id,
              name: data.name || prev.name || 'Usuário',
              email: authUser.email || prev.email,
              avatar: data.avatar_url || prev.avatar,
              weight: data.weight || prev.weight,
              height: data.height || prev.height,
              age: data.age || prev.age,
              gender: (data.gender as UserProfile['gender']) || prev.gender,
              activityLevel:
                (data.activity_level as UserProfile['activityLevel']) ||
                prev.activityLevel,
              goal: (data.goal as UserProfile['goal']) || prev.goal,
              calorieGoal: data.calorie_goal || prev.calorieGoal,
              proteinGoal: data.protein_goal || prev.proteinGoal,
              carbsGoal: data.carbs_goal || prev.carbsGoal,
              fatsGoal: data.fats_goal || prev.fatsGoal,
              waterGoal: data.water_goal || prev.waterGoal,
              visibleWidgets: data.visible_widgets || prev.visibleWidgets,
              phone: data.phone || prev.phone,
            }))
          }
        })

      // Fetch Logs
      supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: true })
        .then(({ data }) => {
          if (data) {
            const logs: DayLog[] = data.map((d: any) => ({
              date: d.date,
              waterIntake: d.water_intake,
              weight: d.weight,
              photo: d.photo_url,
              exerciseBurned: d.exercise_burned,
              sleepHours: d.sleep_hours,
            }))
            setDailyLogs(logs)
          }
        })
    }
  }, [authUser])

  // Notification Logic
  useEffect(() => {
    if (!('Notification' in window)) return

    if (Notification.permission !== 'granted') {
      Notification.requestPermission()
    }

    const checkNotifications = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const scheduledHours = [7, 10, 13, 16, 19, 22]

      if (scheduledHours.includes(hours) && minutes === 0) {
        const title =
          hours % 2 === 0 ? 'Hora da Refeição!' : 'Hora de Beber Água!'
        const body =
          hours % 2 === 0
            ? 'Mantenha o foco na sua dieta.'
            : 'Mantenha-se hidratado.'

        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/favicon.ico' })
        } else {
          toast.info(title, { description: body })
        }
      }
    }

    const interval = setInterval(checkNotifications, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const login = (u: string, p: string) => {
    signIn(u, p).then(({ error }) => {
      if (error) toast.error('Erro ao entrar: ' + error.message)
      else toast.success('Bem-vindo!')
    })
    return true
  }

  const logout = () => {
    signOut()
  }

  const updateUser = async (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }))
    if (authUser) {
      // Map camelCase to snake_case for Supabase
      const payload: any = {}
      if (data.name !== undefined) payload.name = data.name
      if (data.avatar !== undefined) payload.avatar_url = data.avatar
      if (data.weight !== undefined) payload.weight = data.weight
      if (data.height !== undefined) payload.height = data.height
      if (data.age !== undefined) payload.age = data.age
      if (data.gender !== undefined) payload.gender = data.gender
      if (data.activityLevel !== undefined)
        payload.activity_level = data.activityLevel
      if (data.visibleWidgets !== undefined)
        payload.visible_widgets = data.visibleWidgets
      if (data.phone !== undefined) payload.phone = data.phone
      if (data.calorieGoal !== undefined)
        payload.calorie_goal = data.calorieGoal
      if (data.proteinGoal !== undefined)
        payload.protein_goal = data.proteinGoal
      if (data.carbsGoal !== undefined) payload.carbs_goal = data.carbsGoal
      if (data.fatsGoal !== undefined) payload.fats_goal = data.fatsGoal
      if (data.waterGoal !== undefined) payload.water_goal = data.waterGoal
      if (data.goal !== undefined) payload.goal = data.goal

      await supabase.from('profiles').update(payload).eq('id', authUser.id)
    }
  }

  const toggleWidget = (widget: string) => {
    const currentWidgets = user.visibleWidgets || []
    const newWidgets = currentWidgets.includes(widget)
      ? currentWidgets.filter((w) => w !== widget)
      : [...currentWidgets, widget]
    updateUser({ visibleWidgets: newWidgets })
  }

  const addRecipe = (recipe: Recipe) => {
    setRecipes((prev) => [...prev, recipe])
  }

  const toggleFavorite = (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)),
    )
  }

  const addMealToPlan = (date: string, type: MealType, recipeId: string) => {
    setMealPlan((prev) => [...prev, { date, type, recipeId, completed: false }])
  }

  const removeMealFromPlan = (date: string, type: MealType) => {
    setMealPlan((prev) => {
      const index = prev.findIndex((s) => s.date === date && s.type === type)
      if (index === -1) return prev
      const newPlan = [...prev]
      newPlan.splice(index, 1)
      return newPlan
    })
  }

  const toggleMealCompletion = (date: string, type: MealType) => {
    setMealPlan((prev) =>
      prev.map((slot) =>
        slot.date === date && slot.type === type
          ? { ...slot, completed: !slot.completed }
          : slot,
      ),
    )
  }

  const autoGeneratePlan = (startDate: string) => {
    const days = 7
    const newPlan: MealSlot[] = []
    const types: MealType[] = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar']

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = format(date, 'yyyy-MM-dd')

      types.forEach((type) => {
        let categoryFilter: string[] = []
        if (type === 'Café da Manhã' || type === 'Lanche')
          categoryFilter = ['Lanches', 'Doces', 'Drinks']
        else categoryFilter = ['Salgadas']

        const candidates = recipes.filter((r) =>
          categoryFilter.includes(r.category),
        )
        const randomRecipe =
          candidates[Math.floor(Math.random() * candidates.length)]

        if (randomRecipe) {
          newPlan.push({
            date: dateStr,
            type,
            recipeId: randomRecipe.id,
            completed: false,
          })
        }
      })
    }
    setMealPlan((prev) => {
      const existingDates = new Set(newPlan.map((p) => p.date))
      const filteredPrev = prev.filter((p) => !existingDates.has(p.date))
      return [...filteredPrev, ...newPlan]
    })
  }

  const logWater = async (amount: number, date: string) => {
    const existing = dailyLogs.find((l) => l.date === date)
    const newAmount = Math.max(0, (existing?.waterIntake || 0) + amount)

    setDailyLogs((prev) => {
      if (existing) {
        return prev.map((l) =>
          l.date === date ? { ...l, waterIntake: newAmount } : l,
        )
      } else {
        return [
          ...prev,
          {
            date,
            waterIntake: newAmount,
            weight: user.weight,
            exerciseBurned: 0,
            sleepHours: 0,
          },
        ]
      }
    })

    if (authUser) {
      await supabase.from('daily_logs').upsert(
        {
          user_id: authUser.id,
          date,
          water_intake: newAmount,
        },
        { onConflict: 'user_id,date' },
      )
    }
  }

  const logWeight = async (weight: number, date: string, photo?: string) => {
    const previousWeights = dailyLogs
      .filter((l) => l.weight)
      .map((l) => l.weight!)
    const minWeight =
      previousWeights.length > 0 ? Math.min(...previousWeights) : user.weight

    if (weight < minWeight && user.goal === 'Emagrecer') {
      setHasNewPR(true)
    }

    setDailyLogs((prev) => {
      const existing = prev.find((l) => l.date === date)
      if (existing) {
        return prev.map((l) =>
          l.date === date
            ? { ...l, weight: weight, photo: photo || l.photo }
            : l,
        )
      } else {
        return [
          ...prev,
          {
            date,
            waterIntake: 0,
            weight: weight,
            photo: photo,
            exerciseBurned: 0,
            sleepHours: 0,
          },
        ]
      }
    })
    updateUser({ weight })

    if (authUser) {
      const payload: any = {
        user_id: authUser.id,
        date,
        weight,
      }
      if (photo) payload.photo_url = photo

      await supabase
        .from('daily_logs')
        .upsert(payload, { onConflict: 'user_id,date' })
    }
  }

  const logExercise = (calories: number, date: string) => {
    setDailyLogs((prev) => {
      const existing = prev.find((l) => l.date === date)
      if (existing) {
        return prev.map((l) =>
          l.date === date
            ? { ...l, exerciseBurned: (l.exerciseBurned || 0) + calories }
            : l,
        )
      } else {
        return [
          ...prev,
          {
            date,
            waterIntake: 0,
            weight: user.weight,
            exerciseBurned: calories,
            sleepHours: 0,
          },
        ]
      }
    })
  }

  const logSleep = (hours: number, date: string) => {
    setDailyLogs((prev) => {
      const existing = prev.find((l) => l.date === date)
      if (existing) {
        return prev.map((l) =>
          l.date === date ? { ...l, sleepHours: hours } : l,
        )
      } else {
        return [
          ...prev,
          {
            date,
            waterIntake: 0,
            weight: user.weight,
            exerciseBurned: 0,
            sleepHours: hours,
          },
        ]
      }
    })
  }

  const resetPR = () => setHasNewPR(false)

  const addShoppingItem = (item: Omit<ShoppingItem, 'id' | 'checked'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: Math.random().toString(36).substring(7),
      checked: false,
    }
    setShoppingList((prev) => [...prev, newItem])
  }

  const addIngredientsToShoppingList = (ingredients: Ingredient[]) => {
    const newItems = ingredients.map((ing) => ({
      ...ing,
      id: Math.random().toString(36).substring(7),
      checked: false,
    }))
    setShoppingList((prev) => [...prev, ...newItems])
  }

  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    )
  }

  const removeShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id))
  }

  const clearShoppingList = () => {
    setShoppingList([])
  }

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const toggleHydrationSettings = (setting: 'enabled' | 'sound') => {
    setHydrationSettings((prev) => ({ ...prev, [setting]: !prev[setting] }))
  }

  const getDailyNutrition = (date: string) => {
    const slots = mealPlan.filter((s) => s.date === date)
    const nutrition = { calories: 0, protein: 0, carbs: 0, fats: 0 }
    slots.forEach((slot) => {
      const recipe = recipes.find((r) => r.id === slot.recipeId)
      if (recipe) {
        nutrition.calories += recipe.calories
        nutrition.protein += recipe.protein
        nutrition.carbs += recipe.carbs
        nutrition.fats += recipe.fats
      }
    })
    return nutrition
  }

  const getConsumedNutrition = (date: string) => {
    const slots = mealPlan.filter((s) => s.date === date && s.completed)
    const nutrition = { calories: 0, protein: 0, carbs: 0, fats: 0 }
    slots.forEach((slot) => {
      const recipe = recipes.find((r) => r.id === slot.recipeId)
      if (recipe) {
        nutrition.calories += recipe.calories
        nutrition.protein += recipe.protein
        nutrition.carbs += recipe.carbs
        nutrition.fats += recipe.fats
      }
    })
    return nutrition
  }

  const addScannedProduct = (product: ScannedProduct) => {
    setScannedHistory((prev) => [product, ...prev])
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!authUser,
        login,
        logout,
        updateUser,
        toggleWidget,
        recipes,
        addRecipe,
        toggleFavorite,
        mealPlan,
        addMealToPlan,
        removeMealFromPlan,
        toggleMealCompletion,
        autoGeneratePlan,
        dailyLogs,
        logWater,
        logWeight,
        logExercise,
        logSleep,
        shoppingList,
        addShoppingItem,
        addIngredientsToShoppingList,
        toggleShoppingItem,
        removeShoppingItem,
        clearShoppingList,
        notifications,
        markNotificationsAsRead,
        hydrationSettings,
        toggleHydrationSettings,
        getDailyNutrition,
        getConsumedNutrition,
        hasNewPR,
        resetPR,
        scannedHistory,
        addScannedProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider')
  }
  return context
}

export default useAppStore
