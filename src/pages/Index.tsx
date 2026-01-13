import { useAppStore } from '@/stores/useAppStore'
import { format } from 'date-fns'
import { Plus, Minus, Droplets, ChevronRight, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { ContentFeed } from '@/components/ContentFeed'
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
    getDailyNutrition,
  } = useAppStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLog = dailyLogs.find((l) => l.date === today) || {
    waterIntake: 0,
    weight: user.weight,
    exerciseBurned: 0,
    sleepHours: 0,
  }

  // Combine Consumed from Meal Plan + Daily Log Totals (for simplicity in this view we use getConsumedNutrition for planned meals)
  // But now we have totalCalories from triggers.
  // For the hierarchy circle, let's use the DB calculated totals if available, otherwise fallback.
  const dbTotals = getDailyNutrition(today)
  const consumed = {
    calories: dbTotals.calories,
    protein: dbTotals.protein,
    carbs: dbTotals.carbs,
    fats: dbTotals.fats,
  }

  const dailyGoal = user.calorieGoal
  const remainingCalories = dailyGoal - consumed.calories

  const todayMeals = mealPlan
    .filter((slot) => slot.date === today)
    .sort((a, b) => {
      const order = { 'Café da Manhã': 1, Almoço: 2, Lanche: 3, Jantar: 4 }
      return order[a.type] - order[b.type]
    })

  const handleWater = (amount: number) => {
    logWater(amount, today)
    if (amount > 0) {
      toast.success('Hidratação +250ml')
    }
  }

  const isWidgetVisible = (id: string) =>
    user.visibleWidgets?.includes(id) ?? true

  return (
    <div className="space-y-8 pb-24 px-1">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-shadow-lg text-foreground">
            Olá, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Seu corpo, seu combustível.
          </p>
        </div>
      </div>

      {/* 1. Status - Hierarchy Circle */}
      {isWidgetVisible('macros') && (
        <div className="flex justify-center py-6">
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
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Hidratação */}
        {isWidgetVisible('hydration') && (
          <div className="space-y-6">
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
                      Meta Diária: {user.waterGoal}ml
                    </p>
                  </div>
                </div>

                <div className="h-6 w-full bg-white/50 dark:bg-black/20 rounded-full overflow-hidden border border-white/40 shadow-inner mb-6 relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out animate-liquid-flow"
                    style={{
                      width: `${Math.min(100, (todayLog.waterIntake / user.waterGoal) * 100)}%`,
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
        )}

        {/* 3. Sleep Widget */}
        {isWidgetVisible('sleep') && <SleepTracker />}

        {/* 4. Refeições do Dia */}
        {isWidgetVisible('meals') && (
          <div>
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
            {todayMeals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {todayMeals.map((slot) => {
                  const recipe = recipes.find((r) => r.id === slot.recipeId)
                  if (!recipe) return null
                  return (
                    <div
                      key={`${slot.date}-${slot.type}-${slot.recipeId}`}
                      className={cn(
                        'aero-card p-3 flex items-center gap-4 group transition-all duration-500',
                        slot.completed && 'opacity-70 grayscale-[0.3]',
                      )}
                    >
                      <div className="pl-2">
                        <Checkbox
                          checked={slot.completed}
                          onCheckedChange={() =>
                            toggleMealCompletion(slot.date, slot.type)
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
                          className="h-20 w-20 rounded-[16px] object-cover shadow-md group-hover:scale-105 transition-transform duration-500"
                          alt={recipe.title}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-primary font-bold mb-1 uppercase tracking-wider">
                            {slot.type}
                          </p>
                          <p
                            className={cn(
                              'font-bold truncate text-lg transition-all text-foreground',
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
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
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
        )}
      </div>

      {/* 5. Content Feed - Interative Glass Cards - Respect Settings */}
      {!user.hideArticles && isWidgetVisible('content') && <ContentFeed />}
    </div>
  )
}
