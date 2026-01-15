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
} from '@/lib/types'
import { MOCK_USER, MOCK_RECIPES } from '@/lib/data'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

interface AppContextType {
  user: UserProfile
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, pass: string) => boolean
  logout: () => void
  updateUser: (data: Partial<UserProfile>) => void
  toggleWidget: (widget: string) => void
  reorderWidgets: (newOrder: string[]) => void
  recipes: Recipe[]
  addRecipe: (recipe: Recipe) => void
  toggleFavorite: (id: string) => void
  mealPlan: MealSlot[]
  addMealToPlan: (date: string, type: MealType, recipeId: string) => void
  removeMealFromPlan: (id: string) => void
  toggleMealCompletion: (slotId: string) => void
  autoGeneratePlan: (startDate: string) => void
  dailyLogs: DayLog[]
  logWater: (amount: number, date: string) => void
  logWeight: (weight: number, date: string, photo?: string) => void
  logExercise: (calories: number, date: string) => void
  logSleep: (hours: number, date: string) => void
  addMeal: (meal: Meal) => Promise<void>
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
  const [isLoading, setIsLoading] = useState(true)
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
      setIsLoading(true)
      const fetchProfile = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
        .then(({ data }) => {
          if (data) {
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
              homeLayoutOrder: data.home_layout_order
                ? (data.home_layout_order as string[])
                : prev.homeLayoutOrder || [
                    'macros',
                    'hydration',
                    'sleep',
                    'meals',
                  ],
              favoriteRecipes: data.favorite_recipes || [],
            }))
          }
        })

      const fetchLogs = supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: true })
        .then(({ data }) => {
          if (data) {
            const logs: DayLog[] = data.map((d: any) => ({
              date: d.date,
              waterIntake: d.water_intake || 0,
              weight: d.weight,
              photo: d.photo_url,
              exerciseBurned: d.exercise_burned || 0,
              sleepHours: d.sleep_hours || 0,
              totalCalories: d.total_calories || 0,
              totalProtein: d.total_protein || 0,
              totalCarbs: d.total_carbs || 0,
              totalFats: d.total_fats || 0,
            }))
            setDailyLogs(logs)
          }
        })

      const fetchRecipes = supabase
        .from('recipes')
        .select('*')
        .then(({ data }) => {
          if (data && data.length > 0) {
            const mappedRecipes: Recipe[] = data.map((r: any) => ({
              id: r.id,
              title: r.title,
              image: r.image_url || '',
              calories: r.macros?.calories || 0,
              protein: r.macros?.protein || 0,
              carbs: r.macros?.carbs || 0,
              fats: r.macros?.fats || 0,
              prepTime: r.prep_time || 0,
              portions: 1,
              difficulty: r.difficulty as any,
              category: r.category as any,
              tags: r.tags || [],
              ingredients: r.ingredients || [],
              instructions: r.instructions || [],
              rating: 5,
              isFavorite: false, // will be updated by profile favorites
            }))
            setRecipes((prev) => {
              const dbIds = new Set(mappedRecipes.map((r) => r.id))
              const uniqueMocks = prev.filter((r) => !dbIds.has(r.id))
              return [...uniqueMocks, ...mappedRecipes]
            })
          }
        })

      const fetchMealPlans = supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', authUser.id)
        .then(({ data }) => {
          if (data) {
            const plans: MealSlot[] = data.map((p: any) => ({
              id: p.id,
              date: p.date,
              type: p.type as MealType,
              recipeId: p.recipe_id,
              completed: p.completed,
            }))
            setMealPlan(plans)
          }
        })

      Promise.all([
        fetchProfile,
        fetchLogs,
        fetchRecipes,
        fetchMealPlans,
      ]).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [authUser])

  // Sync Favorites after profile load
  useEffect(() => {
    if (user.favoriteRecipes) {
      setRecipes((prev) =>
        prev.map((r) => ({
          ...r,
          isFavorite: user.favoriteRecipes.includes(r.id),
        })),
      )
    }
  }, [user.favoriteRecipes])

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
      if (data.homeLayoutOrder !== undefined)
        payload.home_layout_order = data.homeLayoutOrder
      if (data.phone !== undefined) payload.phone = data.phone
      if (data.calorieGoal !== undefined)
        payload.calorie_goal = data.calorieGoal
      if (data.proteinGoal !== undefined)
        payload.protein_goal = data.proteinGoal
      if (data.carbsGoal !== undefined) payload.carbs_goal = data.carbsGoal
      if (data.fatsGoal !== undefined) payload.fats_goal = data.fatsGoal
      if (data.waterGoal !== undefined) payload.water_goal = data.waterGoal
      if (data.goal !== undefined) payload.goal = data.goal
      if (data.favoriteRecipes !== undefined)
        payload.favorite_recipes = data.favoriteRecipes

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

  const reorderWidgets = (newOrder: string[]) => {
    updateUser({ homeLayoutOrder: newOrder })
  }

  const addRecipe = async (recipe: Recipe) => {
    setRecipes((prev) => [...prev, recipe])
    if (authUser) {
      const payload = {
        title: recipe.title,
        image_url: recipe.image,
        macros: {
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fats: recipe.fats,
        },
        prep_time: recipe.prepTime,
        difficulty: recipe.difficulty,
        category: recipe.category,
        tags: recipe.tags,
        ingredients: recipe.ingredients as any,
        instructions: recipe.instructions,
        user_id: authUser.id,
      }
      await supabase.from('recipes').insert(payload)
    }
  }

  const toggleFavorite = (id: string) => {
    const isFav = user.favoriteRecipes.includes(id)
    const newFavorites = isFav
      ? user.favoriteRecipes.filter((fav) => fav !== id)
      : [...user.favoriteRecipes, id]

    updateUser({ favoriteRecipes: newFavorites })
  }

  const addMealToPlan = async (
    date: string,
    type: MealType,
    recipeId: string,
  ) => {
    // Generate a temporary ID if offline, but use DB ID when possible
    const tempId = Math.random().toString(36).substr(2, 9)

    setMealPlan((prev) => [
      ...prev,
      { id: tempId, date, type, recipeId, completed: false },
    ])
    if (authUser) {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: authUser.id,
          date,
          type,
          recipe_id: recipeId,
          completed: false,
        })
        .select()

      if (data && data[0]) {
        // Update the temp ID with real DB ID
        setMealPlan((prev) =>
          prev.map((s) => (s.id === tempId ? { ...s, id: data[0].id } : s)),
        )
      }
    }
  }

  const removeMealFromPlan = async (id: string) => {
    setMealPlan((prev) => prev.filter((s) => s.id !== id))
    if (authUser) {
      await supabase.from('meal_plans').delete().eq('id', id)
    }
  }

  const toggleMealCompletion = async (slotId: string) => {
    const slot = mealPlan.find((s) => s.id === slotId)
    if (!slot) return

    const newCompleted = !slot.completed
    setMealPlan((prev) =>
      prev.map((s) =>
        s.id === slotId ? { ...s, completed: newCompleted } : s,
      ),
    )

    if (authUser) {
      await supabase
        .from('meal_plans')
        .update({ completed: newCompleted })
        .eq('id', slotId)
    }
  }

  const autoGeneratePlan = async (startDate: string) => {
    const days = 7
    const newPlans: any[] = []
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
          newPlans.push({
            date: dateStr,
            type,
            recipeId: randomRecipe.id,
            completed: false,
            id: Math.random().toString(36).substr(2, 9), // Temp ID
          })
        }
      })
    }

    setMealPlan((prev) => {
      // We append, not replace, so multiple plans can exist
      return [...prev, ...newPlans]
    })

    if (authUser) {
      const dbPayload = newPlans.map((p) => ({
        user_id: authUser.id,
        date: p.date,
        type: p.type,
        recipe_id: p.recipeId,
        completed: false,
      }))

      const { data } = await supabase
        .from('meal_plans')
        .insert(dbPayload)
        .select()

      if (data) {
        // Refresh plan from DB to get IDs
        const plans: MealSlot[] = data.map((p: any) => ({
          id: p.id,
          date: p.date,
          type: p.type as MealType,
          recipeId: p.recipe_id,
          completed: p.completed,
        }))
        // Merge with existing but prefer DB data for new items
        setMealPlan((prev) => {
          const oldItems = prev.filter(
            (p) => !newPlans.find((np) => np.id === p.id),
          ) // Remove temp items
          return [...oldItems, ...plans]
        })
      }
    }
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

  const addMeal = async (meal: Meal) => {
    // Optimistic update for UI instant feedback
    setDailyLogs((prev) => {
      const existing = prev.find((l) => l.date === meal.date)
      const newTotalCalories = (existing?.totalCalories || 0) + meal.calories
      const newTotalProtein = (existing?.totalProtein || 0) + meal.protein
      const newTotalCarbs = (existing?.totalCarbs || 0) + meal.carbs
      const newTotalFats = (existing?.totalFats || 0) + meal.fats

      if (existing) {
        return prev.map((l) =>
          l.date === meal.date
            ? {
                ...l,
                totalCalories: newTotalCalories,
                totalProtein: newTotalProtein,
                totalCarbs: newTotalCarbs,
                totalFats: newTotalFats,
              }
            : l,
        )
      } else {
        return [
          ...prev,
          {
            date: meal.date,
            waterIntake: 0,
            totalCalories: meal.calories,
            totalProtein: meal.protein,
            totalCarbs: meal.carbs,
            totalFats: meal.fats,
          },
        ]
      }
    })

    if (authUser) {
      await supabase.from('meals').insert({
        user_id: authUser.id,
        date: meal.date,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
      })
      // Sync Logs
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('date', meal.date)
        .single()

      const currentCals = logs?.total_calories || 0
      const currentProt = logs?.total_protein || 0
      const currentCarbs = logs?.total_carbs || 0
      const currentFats = logs?.total_fats || 0

      await supabase.from('daily_logs').upsert(
        {
          user_id: authUser.id,
          date: meal.date,
          total_calories: currentCals + meal.calories,
          total_protein: currentProt + meal.protein,
          total_carbs: currentCarbs + meal.carbs,
          total_fats: currentFats + meal.fats,
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

  const getConsumedNutrition = (date: string) => {
    // 1. Get Ad-hoc logs (Scanner, manual entry via addMeal)
    const log = dailyLogs.find((l) => l.date === date)
    const adhocCalories = log?.totalCalories || 0
    const adhocProtein = log?.totalProtein || 0
    const adhocCarbs = log?.totalCarbs || 0
    const adhocFats = log?.totalFats || 0

    // 2. Get Planned meals marked as completed
    const plannedSlots = mealPlan.filter((s) => s.date === date && s.completed)
    let plannedCalories = 0
    let plannedProtein = 0
    let plannedCarbs = 0
    let plannedFats = 0

    plannedSlots.forEach((slot) => {
      const recipe = recipes.find((r) => r.id === slot.recipeId)
      if (recipe) {
        plannedCalories += recipe.calories
        plannedProtein += recipe.protein
        plannedCarbs += recipe.carbs
        plannedFats += recipe.fats
      }
    })

    // 3. Sum total
    return {
      calories: adhocCalories + plannedCalories,
      protein: adhocProtein + plannedProtein,
      carbs: adhocCarbs + plannedCarbs,
      fats: adhocFats + plannedFats,
    }
  }

  const addScannedProduct = (product: ScannedProduct) => {
    setScannedHistory((prev) => [product, ...prev])
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!authUser,
        isLoading,
        login,
        logout,
        updateUser,
        toggleWidget,
        reorderWidgets,
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
        addMeal,
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
