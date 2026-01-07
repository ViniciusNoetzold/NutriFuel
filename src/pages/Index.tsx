import { useAppStore } from '@/stores/useAppStore'
import { format } from 'date-fns'
import {
  Plus,
  Minus,
  Droplets,
  ChevronRight,
  Calendar,
  Scale,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { GlossyCardButton } from '@/components/GlossyCardButton'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export default function Index() {
  const {
    user,
    dailyLogs,
    logWater,
    getDailyNutrition,
    mealPlan,
    recipes,
    toggleMealCompletion,
  } = useAppStore()
  const navigate = useNavigate()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLog = dailyLogs.find((l) => l.date === today) || {
    waterIntake: 0,
    weight: user.weight,
  }
  const nutrition = getDailyNutrition(today)

  const todayMeals = mealPlan
    .filter((slot) => slot.date === today)
    .sort((a, b) => {
      const order = { 'Café da Manhã': 1, Almoço: 2, Lanche: 3, Jantar: 4 }
      return order[a.type] - order[b.type]
    })

  const completedMealsCount = todayMeals.filter((m) => m.completed).length
  const totalMealsCount = todayMeals.length
  const progressPercent =
    totalMealsCount > 0 ? (completedMealsCount / totalMealsCount) * 100 : 0

  const handleWater = (amount: number) => {
    logWater(amount, today)
    if (amount > 0) {
      toast.success('Hidratação +250ml')
    }
  }

  return (
    <div className="space-y-8 pb-24 px-1">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-shadow-lg">
            Olá, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-lg text-muted-foreground/80 font-medium">
            Seu corpo, seu templo.
          </p>
        </div>
      </div>

      {/* Global Progress */}
      <div className="aero-glass p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>Progresso Diário</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-4 bg-white/50 rounded-full overflow-hidden border border-white/30 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary to-green-400 dark:from-primary dark:to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="w-full h-1/2 bg-white/30" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hydration & Actions */}
        <div className="space-y-6">
          {/* Hydration Control */}
          <Card className="aero-card border-0 bg-cyan-50/30 dark:bg-cyan-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-cyan-500 p-2 rounded-full shadow-lg shadow-cyan-500/30 text-white">
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Hidratação</h3>
                  <p className="text-xs text-muted-foreground">
                    Meta Diária: {user.waterGoal}ml
                  </p>
                </div>
              </div>

              {/* Liquid Progress Bar */}
              <div className="h-6 w-full bg-white/50 dark:bg-black/20 rounded-full overflow-hidden border border-white/30 shadow-inner mb-6 relative">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(100, (todayLog.waterIntake / user.waterGoal) * 100)}%`,
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30" />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1 aero-button bg-cyan-100/50 hover:bg-cyan-200/50 text-cyan-600 border-cyan-200/50"
                  variant="ghost"
                  onClick={() => handleWater(-250)}
                  disabled={todayLog.waterIntake <= 0}
                >
                  <Minus className="mr-2 h-4 w-4" /> 250ml
                </Button>
                <Button
                  className="flex-1 aero-button bg-blue-100/50 hover:bg-blue-200/50 text-blue-600 border-blue-200/50"
                  variant="ghost"
                  onClick={() => handleWater(250)}
                >
                  <Plus className="mr-2 h-4 w-4" /> 250ml
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <GlossyCardButton
              icon={Calendar}
              title="Ver Plano"
              onClick={() => navigate('/plan')}
            />
            <GlossyCardButton
              icon={Scale}
              title="Registrar Peso"
              onClick={() => navigate('/profile')}
            />
          </div>
        </div>

        {/* Status Bubble */}
        <Card className="aero-glass border-0 relative overflow-hidden min-h-[300px] flex items-center justify-center transition-all duration-700 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-100/20 via-transparent to-blue-100/20 pointer-events-none" />
          <CardContent className="p-6 text-center z-10 w-full">
            <h3 className="text-lg font-semibold mb-6 text-muted-foreground uppercase tracking-widest">
              Status Atual
            </h3>

            {/* The Bubble */}
            <div className="relative mx-auto w-48 h-48">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 backdrop-blur-sm border border-white/40 shadow-[0_0_50px_rgba(var(--primary),0.2)] animate-float flex items-center justify-center group">
                <div className="absolute top-4 left-8 w-12 h-6 bg-white/40 rounded-full blur-[2px] transform -rotate-45" />

                <div className="text-center">
                  <p className="text-5xl font-bold text-primary drop-shadow-sm">
                    {todayLog.weight?.toFixed(1)}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    kg Atual
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold">{nutrition.calories}</p>
                <p className="text-xs text-muted-foreground uppercase">kcal</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-500">
                  {todayLog.waterIntake}
                </p>
                <p className="text-xs text-muted-foreground uppercase">
                  ml Água
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Meals with Checkboxes */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-xl text-shadow">Refeições de Hoje</h3>
          <Link
            to="/plan"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Ver tudo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {todayMeals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {todayMeals.map((slot, index) => {
              const recipe = recipes.find((r) => r.id === slot.recipeId)
              if (!recipe) return null
              return (
                <div
                  key={`${slot.date}-${slot.type}`}
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
                          'font-bold truncate text-lg transition-all',
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
              <Button className="aero-button px-8">Planejar Refeições</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
