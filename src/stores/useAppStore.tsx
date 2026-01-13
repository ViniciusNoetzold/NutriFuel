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
  Meal,
  EvolutionLog,
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
  addMeal: (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  evolutionLogs: EvolutionLog[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Bem-vindo ao NutriFuel',
    message: 'Configure seu perfil para começar.',
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
  const [evolutionLogs, setEvolutionLogs] = useState<EvolutionLog[]>([])

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
            setUser({
              ...MOCK_USER,
              ...data,
              email: authUser.email,
              avatar: data.avatar_url || MOCK_USER.avatar,
              visibleWidgets: data.visible_widgets || MOCK_USER.visibleWidgets,
              hideArticles: data.hide_articles || false,
            })
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
              totalCalories: d.total_calories,
              totalProtein: d.total_protein,
              totalCarbs: d.total_carbs,
              totalFats: d.total_fats,
            }))
            setDailyLogs(logs)
          }
        })

      // Fetch Evolution Logs
      supabase
        .from('evolution_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: true })
        .then(({ data }) => {
          if (data) setEvolutionLogs(data as EvolutionLog[])
        })
    }
  }, [authUser])

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
      await supabase
        .from('profiles')
        .update({
          name: data.name,
          avatar_url: data.avatar,
          weight: data.weight,
          height: data.height,
          age: data.age,
          gender: data.gender,
          activity_level: data.activityLevel,
          visible_widgets: data.visibleWidgets,
          phone: data.phone,
          hide_articles: data.hideArticles,
        })
        .eq('id', authUser.id)
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
    if (authUser) {
      supabase
        .from('recipes')
        .insert({
          user_id: authUser.id,
          title: recipe.title,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          macros: {
            calories: recipe.calories,
            protein: recipe.protein,
            carbs: recipe.carbs,
            fats: recipe.fats,
          },
          image_url: recipe.image,
          prep_time: recipe.prepTime,
          difficulty: recipe.difficulty,
          category: recipe.category,
          tags: recipe.tags,
        })
        .then()
    }
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
    // Basic implementation for MVP demo
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

    // Add notification to history
    if (amount > 0) {
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          title: 'Hidratação',
          message: `Registrado: ${amount}ml`,
          date: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ])
    }
  }

  const logWeight = async (weight: number, date: string, photo?: string) => {
    // 1. Update Profile
    updateUser({ weight })

    // 2. Add to Evolution Logs
    if (authUser) {
      await supabase.from('evolution_logs').insert({
        user_id: authUser.id,
        date,
        weight,
        photo_url: photo,
      })

      // Refresh evolution logs
      const { data } = await supabase
        .from('evolution_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: true })

      if (data) setEvolutionLogs(data as EvolutionLog[])
    }

    // 3. Update Daily Logs (Backward compatibility for charts)
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

  const logSleep = async (hours: number, date: string) => {
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

    if (authUser) {
      await supabase.from('daily_logs').upsert(
        {
          user_id: authUser.id,
          date,
          sleep_hours: hours,
        },
        { onConflict: 'user_id,date' },
      )
    }
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
    // For MVP, we combine meal plan + manually logged meals via daily logs
    // In this version, we will focus on the data from daily_logs which is now auto-aggregated
    const log = dailyLogs.find((l) => l.date === date)
    if (log) {
      return {
        calories: log.totalCalories || 0,
        protein: log.totalProtein || 0,
        carbs: log.totalCarbs || 0,
        fats: log.totalFats || 0,
      }
    }
    return { calories: 0, protein: 0, carbs: 0, fats: 0 }
  }

  const getConsumedNutrition = (date: string) => {
    // Use total from daily log as "consumed"
    const log = dailyLogs.find((l) => l.date === date)
    if (log) {
      return {
        calories: log.totalCalories || 0,
        protein: log.totalProtein || 0,
        carbs: log.totalCarbs || 0,
        fats: log.totalFats || 0,
      }
    }
    return { calories: 0, protein: 0, carbs: 0, fats: 0 }
  }

  const addScannedProduct = (product: ScannedProduct) => {
    setScannedHistory((prev) => [product, ...prev])
  }

  const addMeal = async (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => {
    if (!authUser) return

    // 1. Insert Meal
    const { error } = await supabase.from('meals').insert({
      user_id: authUser.id,
      ...meal,
    })

    if (error) {
      toast.error('Erro ao adicionar refeição')
      throw error
    }

    // 2. Fetch updated Daily Log to sync frontend state
    const { data: logData } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', authUser.id)
      .eq('date', meal.date)
      .single()

    if (logData) {
      setDailyLogs((prev) => {
        const idx = prev.findIndex((l) => l.date === meal.date)
        const newLog = {
          date: logData.date,
          waterIntake: logData.water_intake,
          weight: logData.weight,
          photo: logData.photo_url,
          exerciseBurned: logData.exercise_burned,
          sleepHours: logData.sleep_hours,
          totalCalories: logData.total_calories,
          totalProtein: logData.total_protein,
          totalCarbs: logData.total_carbs,
          totalFats: logData.total_fats,
        }
        if (idx >= 0) {
          const arr = [...prev]
          arr[idx] = newLog
          return arr
        }
        return [...prev, newLog]
      })
    }
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
        addMeal,
        evolutionLogs,
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
