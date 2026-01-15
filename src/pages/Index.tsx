import { useAppStore } from '@/stores/useAppStore'
import { format } from 'date-fns'
import { Plus, Minus, Droplets, ChevronRight, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { SleepTracker } from '@/components/SleepTracker'

export default function Index() {
  const {
    user,
    dailyLogs,
    logWater,
    getConsumedNutrition,
    mealPlan,
    recipes,
    toggleMealCompletion,
  } = useAppStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLog = dailyLogs.find((l) => l.date === today) || {
    waterIntake: 0,
    weight: user.weight,
    exerciseBurned: 0,
    sleepHours: 0,
  }
  const consumed = getConsumedNutrition(today)
  const dailyGoal = user.calorieGoal || 2000 // Fallback to avoid division by zero or NaN
  const remainingCalories = dailyGoal - consumed.calories

  // Group meals by type because we now support multiple items per slot
  const mealsByType = mealPlan
    .filter((slot) => slot.date === today)
    .reduce(
      (acc, slot) => {
        if (!acc[slot.type]) acc[slot.type] = []
        acc[slot.type].push(slot)
        return acc
      },
      {} as Record<string, typeof mealPlan>,
    )

  const mealOrder = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar']

  const handleWater = (amount: number) => {
    logWater(amount, today)
    if (amount > 0) {
      toast.success('Hidratação +250ml')
    }
  }

  const isWidgetVisible = (id: string) =>
    user.visibleWidgets?.includes(id) ?? true

  // Defensive programming: Ensure name exists before splitting
  const userName = user?.name || 'Usuário'
  const firstName = userName.split(' ')[0]

  const renderWidget = (id: string) => {
    switch (id) {
      case 'macros':
        return (
          <div key="macros" className="flex justify-center py-6">
            <div className="relative w-72 h-72 flex items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/40 shadow-2xl">
              <div className="absolute inset-0 rounded-full bg-primary/10 opacity-20" />
              <div className="absolute inset-4 rounded-full border-2 border-white/30" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2">
                <div className="mb-1 p-2 bg-gradient-to-br from-orange-400 to-red-600 rounded-full shadow-[0_4px_12px_rgba(249,115,22,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-white/40 backdrop-blur-sm animate-pulse-slow">
                  <Flame className="w-6 h-6 text-white fill-white" />
                </div>
                <div>
                  <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-cyan-700 dark:to-cyan-400 drop-shadow-sm leading-none">
                    {Math.max(0, Math.floor(remainingCalories))}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Kcal Restantes
                  </p>
                </div>

                {/* Macro Hierarchy */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(consumed.protein)}g
                    </span>
                    <span className="text-[8px] uppercase font-bold text-muted-foreground">
                      Prot
                    </span>
                  </div>
                  <div className="h-6 w-px bg-white/30" />
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {Math.round(consumed.carbs)}g
                    </span>
                    <span className="text-[8px] uppercase font-bold text-muted-foreground">
                      Carb
                    </span>
                  </div>
                  <div className="h-6 w-px bg-white/30" />
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      {Math.round(consumed.fats)}g
                    </span>
                    <span className="text-[8px] uppercase font-bold text-muted-foreground">
                      Gord
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'hydration':
        return (
          <div key="hydration" className="space-y-6">
            <Card className="aero-card border-0 bg-cyan-50/50 dark:bg-cyan-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-cyan-500 p-2 rounded-full shadow-lg shadow-cyan-500/30 text-white">
                    <Droplets className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      Hidratação
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      Meta Diária: {user.waterGoal || 2500}ml
                    </p>
                  </div>
                </div>

                <div className="h-6 w-full bg-white/50 dark:bg-black/20 rounded-full overflow-hidden border border-white/40 shadow-inner mb-6 relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out animate-liquid-flow"
                    style={{
                      width: `${Math.min(100, (todayLog.waterIntake / (user.waterGoal || 2500)) * 100)}%`,
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    className="flex-1 aero-button bg-cyan-100/70 hover:bg-cyan-200/70 text-cyan-700 border-cyan-200/50"
                    variant="ghost"
                    onClick={() => handleWater(-250)}
                    disabled={todayLog.waterIntake <= 0}
                  >
                    <Minus className="mr-2 h-4 w-4" /> 250ml
                  </Button>
                  <Button
                    className="flex-1 aero-button bg-blue-100/70 hover:bg-blue-200/70 text-blue-700 border-blue-200/50"
                    variant="ghost"
                    onClick={() => handleWater(250)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> 250ml
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case 'sleep':
        return (
          <div key="sleep">
            <SleepTracker />
          </div>
        )
      case 'meals':
        return (
          <div key="meals">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-xl text-shadow text-foreground">
                Refeições de Hoje
              </h3>
              <Link
                to="/plan"
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Ver tudo <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {Object.keys(mealsByType).length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {mealOrder.map((type) => {
                  const slots = mealsByType[type]
                  if (!slots) return null

                  return (
                    <div key={type} className="space-y-2">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider ml-1">
                        {type}
                      </h4>
                      {slots.map((slot) => {
                        const recipe = recipes.find(
                          (r) => r.id === slot.recipeId,
                        )
                        if (!recipe) return null
                        return (
                          <div
                            key={
                              slot.id ||
                              `${slot.date}-${slot.type}-${slot.recipeId}`
                            }
                            className={cn(
                              'aero-card p-3 flex items-center gap-4 group transition-all duration-500',
                              slot.completed && 'opacity-70 grayscale-[0.3]',
                            )}
                          >
                            <div className="pl-2">
                              <Checkbox
                                checked={slot.completed}
                                onCheckedChange={() =>
                                  toggleMealCompletion(slot.id || '')
                                }
                                className={cn(
                                  'h-6 w-6 rounded-full border-2 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-white transition-all duration-300',
                                  slot.completed && 'animate-glow',
                                )}
                              />
                            </div>
                            <Link
                              to={`/recipes/${recipe.id}`}
                              className="flex-1 flex items-center gap-4 min-w-0"
                            >
                              <img
                                src={recipe.image}
                                className="h-16 w-16 rounded-[12px] object-cover shadow-md group-hover:scale-105 transition-transform duration-500"
                                alt={recipe.title}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    'font-bold truncate text-base transition-all text-foreground',
                                    slot.completed
                                      ? 'line-through text-muted-foreground'
                                      : 'group-hover:text-primary',
                                  )}
                                >
                                  {recipe.title}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                  {recipe.calories} kcal • {recipe.prepTime} min
                                </p>
                              </div>
                              <div className="bg-white/50 p-2 rounded-full shadow-sm">
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="aero-glass p-8 text-center border-dashed border-2 border-white/40">
                <p className="text-muted-foreground font-medium mb-4">
                  Nada planejado para hoje.
                </p>
                <Link to="/plan">
                  <Button className="aero-button px-8">
                    Planejar Refeições
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  // Use configured order with defensive check
  const orderedWidgets = (user.homeLayoutOrder || []).filter((id) =>
    isWidgetVisible(id),
  )

  return (
    <div className="space-y-8 pb-24 px-1">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-shadow-lg text-foreground">
            Olá, {firstName}!
          </h2>
        </div>
      </div>

      <div className="space-y-8">
        {orderedWidgets.map((id) => renderWidget(id))}
      </div>
    </div>
  )
}
