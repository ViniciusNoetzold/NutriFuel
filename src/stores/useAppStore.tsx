import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  UserProfile,
  Recipe,
  MealSlot,
  DayLog,
  MealType,
  Ingredient,
} from '@/lib/types'
import { MOCK_USER, MOCK_RECIPES } from '@/lib/data'
import { format } from 'date-fns'

interface ShoppingItem extends Ingredient {
  id: string
  checked: boolean
}

interface AppContextType {
  user: UserProfile
  updateUser: (data: Partial<UserProfile>) => void
  recipes: Recipe[]
  mealPlan: MealSlot[]
  addMealToPlan: (date: string, type: MealType, recipeId: string) => void
  removeMealFromPlan: (date: string, type: MealType) => void
  autoGeneratePlan: (startDate: string) => void
  dailyLogs: DayLog[]
  logWater: (amount: number, date: string) => void
  shoppingList: ShoppingItem[]
  toggleShoppingItem: (id: string) => void
  clearShoppingList: () => void
  getDailyNutrition: (date: string) => {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(MOCK_USER)
  const [recipes] = useState<Recipe[]>(MOCK_RECIPES)
  const [mealPlan, setMealPlan] = useState<MealSlot[]>([])
  const [dailyLogs, setDailyLogs] = useState<DayLog[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])

  // Load initial empty logs or plan if needed
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    if (!dailyLogs.find((l) => l.date === today)) {
      setDailyLogs((prev) => [...prev, { date: today, waterIntake: 0 }])
    }
  }, [])

  // Sync shopping list when meal plan changes
  useEffect(() => {
    const newItems: ShoppingItem[] = []
    mealPlan.forEach((slot) => {
      if (slot.recipeId) {
        const recipe = recipes.find((r) => r.id === slot.recipeId)
        recipe?.ingredients.forEach((ing) => {
          // Simple key generation to avoid duplicates if possible, or just list all
          const id = `${slot.date}-${slot.type}-${ing.name}`
          const existing = shoppingList.find((i) => i.id === id)
          newItems.push({
            ...ing,
            id,
            checked: existing ? existing.checked : false,
          })
        })
      }
    })
    setShoppingList(newItems)
  }, [mealPlan, recipes])

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }))
  }

  const addMealToPlan = (date: string, type: MealType, recipeId: string) => {
    setMealPlan((prev) => {
      const filtered = prev.filter(
        (slot) => !(slot.date === date && slot.type === type),
      )
      return [...filtered, { date, type, recipeId }]
    })
  }

  const removeMealFromPlan = (date: string, type: MealType) => {
    setMealPlan((prev) =>
      prev.filter((slot) => !(slot.date === date && slot.type === type)),
    )
  }

  const autoGeneratePlan = (startDate: string) => {
    // Simple mock generator
    const days = 7
    const newPlan: MealSlot[] = []
    const types: MealType[] = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar']

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = format(date, 'yyyy-MM-dd')

      types.forEach((type) => {
        // Pick random recipe based on type roughly
        let categoryFilter: string[] = []
        if (type === 'Café da Manhã' || type === 'Lanche')
          categoryFilter = ['Lanches', 'Sobremesas', 'Drinks']
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
          })
        }
      })
    }
    setMealPlan(newPlan)
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
        return [...prev, { date, waterIntake: amount }]
      }
    })
  }

  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    )
  }

  const clearShoppingList = () => {
    setShoppingList((prev) => prev.filter((item) => !item.checked))
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

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        recipes,
        mealPlan,
        addMealToPlan,
        removeMealFromPlan,
        autoGeneratePlan,
        dailyLogs,
        logWater,
        shoppingList,
        toggleShoppingItem,
        clearShoppingList,
        getDailyNutrition,
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
