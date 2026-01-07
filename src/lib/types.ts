export interface Ingredient {
  name: string
  amount: string
  category:
    | 'Hortifrúti'
    | 'Carnes/Proteínas'
    | 'Laticínios'
    | 'Despensa'
    | 'Outros'
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
  category: 'Salgadas' | 'Lanches' | 'Sobremesas' | 'Drinks'
  tags: string[] // 'Vegan', 'Low Carb', etc.
  ingredients: Ingredient[]
  instructions: string[]
  rating: number
}

export interface UserProfile {
  name: string
  avatar: string
  gender: 'male' | 'female'
  age: number
  weight: number
  height: number
  activityLevel: 'Sedentário' | 'Leve' | 'Moderado' | 'Intenso' | 'Atleta'
  goal: 'Emagrecer' | 'Manter Peso' | 'Ganhar Massa'
  dietaryRestrictions: string[]
  calorieGoal: number
  waterGoal: number
}

export type MealType = 'Café da Manhã' | 'Almoço' | 'Lanche' | 'Jantar'

export interface MealSlot {
  date: string // ISO date string YYYY-MM-DD
  type: MealType
  recipeId: string | null
}

export interface DayLog {
  date: string
  waterIntake: number // in ml
  weight?: number
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
