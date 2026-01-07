import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  UserProfile,
  Recipe,
  MealSlot,
  DayLog,
  MealType,
  Ingredient,
  Notification,
  ShoppingItem,
} from '@/lib/types'
import { MOCK_USER, MOCK_RECIPES } from '@/lib/data'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface AppContextType {
  user: UserProfile
  isAuthenticated: boolean
  login: (username: string, pass: string) => boolean
  logout: () => void
  updateUser: (data: Partial<UserProfile>) => void
  recipes: Recipe[]
  mealPlan: MealSlot[]
  addMealToPlan: (date: string, type: MealType, recipeId: string) => void
  removeMealFromPlan: (date: string, type: MealType) => void
  toggleMealCompletion: (date: string, type: MealType) => void
  autoGeneratePlan: (startDate: string) => void
  dailyLogs: DayLog[]
  logWater: (amount: number, date: string) => void
  logWeight: (weight: number, date: string, photo?: string) => void
  logExercise: (calories: number, date: string) => void
  shoppingList: ShoppingItem[]
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void
  addIngredientsToShoppingList: (ingredients: Ingredient[]) => void
  toggleShoppingItem: (id: string) => void
  removeShoppingItem: (id: string) => void
  clearShoppingList: () => void
  notifications: Notification[]
  markNotificationsAsRead: () => void
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
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Hora de beber água!',
    message: 'Você ainda não bateu sua meta de hoje.',
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    title: 'Nova Receita',
    message: 'Confira a nova receita de Smoothie Verde.',
    date: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserProfile>(MOCK_USER)
  const [recipes] = useState<Recipe[]>(MOCK_RECIPES as Recipe[])
  const [mealPlan, setMealPlan] = useState<MealSlot[]>([])
  const [dailyLogs, setDailyLogs] = useState<DayLog[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [hasNewPR, setHasNewPR] = useState(false)

  // Load initial empty logs or plan if needed
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    if (!dailyLogs.find((l) => l.date === today)) {
      setDailyLogs((prev) => [
        ...prev,
        {
          date: today,
          waterIntake: 0,
          weight: user.weight,
          exerciseBurned: 0,
        },
      ])
    }
  }, [])

  const login = (u: string, p: string) => {
    if (u === 'user' && p === '1234') {
      setIsAuthenticated(true)
      toast.success('Bem-vindo de volta ao NutriFuel!')
      return true
    }
    toast.error('Credenciais inválidas')
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    toast.info('Sessão encerrada')
  }

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }))
  }

  const addMealToPlan = (date: string, type: MealType, recipeId: string) => {
    setMealPlan((prev) => {
      const filtered = prev.filter(
        (slot) => !(slot.date === date && slot.type === type),
      )
      return [...filtered, { date, type, recipeId, completed: false }]
    })
  }

  const removeMealFromPlan = (date: string, type: MealType) => {
    setMealPlan((prev) =>
      prev.filter((slot) => !(slot.date === date && slot.type === type)),
    )
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

  const logWater = (amount: number, date: string) => {
    setDailyLogs((prev) => {
      const existing = prev.find((l) => l.date === date)
      if (existing) {
        return prev.map((l) =>
          l.date === date
            ? { ...l, waterIntake: Math.max(0, l.waterIntake + amount) }
            : l,
        )
      } else {
        return [
          ...prev,
          {
            date,
            waterIntake: Math.max(0, amount),
            weight: user.weight,
            exerciseBurned: 0,
          },
        ]
      }
    })
  }

  const logWeight = (weight: number, date: string, photo?: string) => {
    const previousWeights = dailyLogs
      .filter((l) => l.weight)
      .map((l) => l.weight!)
    const minWeight =
      previousWeights.length > 0 ? Math.min(...previousWeights) : user.weight

    if (weight < minWeight && user.goal === 'Emagrecer') {
      setHasNewPR(true)
    } else if (weight > minWeight && user.goal === 'Ganhar Massa') {
      const maxWeight =
        previousWeights.length > 0 ? Math.max(...previousWeights) : user.weight
      if (weight > maxWeight) setHasNewPR(true)
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
          },
        ]
      }
    })
    updateUser({ weight })
  }

  const logExercise = (calories: number, date: string) => {
    setDailyLogs((prev) => {
      const existing = prev.find((l) => l.date === date)
      if (existing) {
        return prev.map((l) =>
          l.date === date
            ? {
                ...l,
                exerciseBurned: (l.exerciseBurned || 0) + calories,
              }
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

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        updateUser,
        recipes,
        mealPlan,
        addMealToPlan,
        removeMealFromPlan,
        toggleMealCompletion,
        autoGeneratePlan,
        dailyLogs,
        logWater,
        logWeight,
        logExercise,
        shoppingList,
        addShoppingItem,
        addIngredientsToShoppingList,
        toggleShoppingItem,
        removeShoppingItem,
        clearShoppingList,
        notifications,
        markNotificationsAsRead,
        getDailyNutrition,
        getConsumedNutrition,
        hasNewPR,
        resetPR,
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
