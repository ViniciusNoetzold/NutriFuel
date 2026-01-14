import { useAppStore } from '@/stores/useAppStore'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { SleepTracker } from '@/components/SleepTracker'
import { StatusCircle } from '@/components/StatusCircle'
import { HydrationBottle } from '@/components/HydrationBottle'

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

  // Get FRESH nutrition totals from meals table logic (via store)
  const consumed = getConsumedNutrition(today)
  const dailyGoal = user.calorieGoal || 2000
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
      toast.success('Hidratação +250ml', { position: 'bottom-center' })
    }
  }

  const isWidgetVisible = (id: string) =>
    user.visibleWidgets?.includes(id) ?? true

  const userName = user?.name || 'Usuário'
  const firstName = userName.split(' ')[0]

  return (
    <div className="space-y-8 pb-24 px-1">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-shadow-lg text-foreground">
            Olá, {firstName}!
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Seu corpo, seu combustível.
          </p>
        </div>
      </div>

      {/* 1. Status - Hierarchy Circle (Macros) */}
      {isWidgetVisible('macros') && (
        <StatusCircle
          remainingCalories={remainingCalories}
          protein={consumed.protein}
          carbs={consumed.carbs}
          fats={consumed.fats}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Hidratação */}
        {isWidgetVisible('hydration') && (
          <HydrationBottle
            current={todayLog.waterIntake}
            goal={user.waterGoal || 2500}
            onAdd={(val) => handleWater(val)}
            onRemove={(val) => handleWater(-val)}
          />
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
                      key={`${slot.date}-${slot.type}-${slot.recipeId}-${slot.id || 'temp'}`}
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
    </div>
  )
}
