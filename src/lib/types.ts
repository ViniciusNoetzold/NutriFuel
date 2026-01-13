export interface Ingredient {
  name: string
  amount: string
  category:
    | 'Hortifrúti'
    | 'Carnes/Proteínas'
    | 'Laticínios'
    | 'Despensa'
    | 'Outros'
  calories?: number // approximate calories per amount
  protein?: number
  carbs?: number
  fats?: number
}

export interface Recipe {
  id: string
  title: string
  image: string
  calories: number
  protein: number
  carbs: number
  fats: number
  prepTime: number
  portions: number
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
  category: 'Salgadas' | 'Lanches' | 'Doces' | 'Drinks'
  tags: string[]
  ingredients: Ingredient[]
  instructions: string[]
  rating: number
  isFavorite?: boolean
  isCustom?: boolean
}

export interface UserProfile {
  id?: string
  name: string
  avatar: string
  email?: string
  phone?: string
  gender: 'male' | 'female'
  age: number
  weight: number
  height: number
  activityLevel: 'Sedentário' | 'Leve' | 'Moderado' | 'Intenso' | 'Atleta'
  goal: 'Emagrecer' | 'Manter Peso' | 'Ganhar Massa'
  dietaryRestrictions: string[]
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatsGoal: number
  waterGoal: number
  visibleWidgets: string[]
}

export type MealType = 'Café da Manhã' | 'Almoço' | 'Lanche' | 'Jantar'

export interface MealSlot {
  date: string // ISO date string YYYY-MM-DD
  type: MealType
  recipeId: string | null
  completed?: boolean
}

export interface DayLog {
  date: string
  waterIntake: number // in ml
  weight?: number
  photo?: string // URL to shape photo
  exerciseBurned?: number // Calories burned
  sleepHours?: number
}

export interface Notification {
  id: string
  title: string
  message: string
  date: string
  read: boolean
}

export interface ShoppingItem extends Ingredient {
  id: string
  checked: boolean
}

export interface Article {
  id: string
  title: string
  excerpt: string
  image: string
  category: 'Nutrição' | 'Exercício' | 'Bem-estar'
  readTime: string
  content?: string // Full content for the overlay
}

export interface ScannedProduct {
  code: string
  name: string
  brand: string
  calories: number
  protein: number
  carbs: number
  fats: number
  image?: string
  dateScanned: string
}
