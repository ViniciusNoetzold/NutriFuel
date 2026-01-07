import { useAppStore } from '@/stores/useAppStore'
import { format } from 'date-fns'
import {
  Plus,
  Minus,
  Droplets,
  ChevronRight,
  Calendar,
  Scale,
  Flame,
  Utensils,
  Zap,
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
    getConsumedNutrition,
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
  const consumed = getConsumedNutrition(today)

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

      {/* 1. Status Atual - Advanced Nutritional Status Dashboard */}
      <Card className="aero-glass border-0 relative overflow-hidden transition-all duration-700 hover:shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-green-100/20 via-transparent to-blue-100/20 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Status Atual
            </h3>
            <span className="text-xs font-bold bg-white/30 px-2 py-1 rounded-lg text-foreground/70">
              Hoje
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left: Remaining Protein */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-4xl font-extrabold text-primary drop-shadow-sm">
                {Math.max(0, user.proteinGoal - consumed.protein).toFixed(0)}g
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Faltam Proteínas
              </p>
            </div>

            {/* Center: Calories Fire Bubble */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/20 to-red-500/10 backdrop-blur-sm border border-white/40 shadow-[0_0_40px_rgba(249,115,22,0.3)] animate-liquid flex items-center justify-center">
                <div className="text-center">
                  <Flame className="h-10 w-10 text-orange-500 mx-auto mb-1 drop-shadow-md animate-pulse" />
                  <p className="text-3xl font-bold text-foreground drop-shadow-sm">
                    {consumed.calories}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    kcal Consumidas
                  </p>
                </div>
              </div>
              {/* Progress Ring around calories */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient-fire)"
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={
                    283 -
                    Math.min(consumed.calories / user.calorieGoal, 1) * 283
                  }
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient
                    id="gradient-fire"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Right: Macro Breakdown */}
            <div className="flex-1 flex flex-row md:flex-col justify-center gap-4 w-full md:w-auto">
              {[
                {
                  label: 'Carbs',
                  val: consumed.carbs,
                  goal: user.carbsGoal,
                  color: 'text-green-600',
                  bg: 'bg-green-100/50',
                },
                {
                  label: 'Gord',
                  val: consumed.fats,
                  goal: user.fatsGoal,
                  color: 'text-yellow-600',
                  bg: 'bg-yellow-100/50',
                },
                {
                  label: 'Prot',
                  val: consumed.protein,
                  goal: user.proteinGoal,
                  color: 'text-blue-600',
                  bg: 'bg-blue-100/50',
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col items-center md:items-start flex-1 md:flex-none"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        m.color.replace('text', 'bg'),
                      )}
                    />
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      {m.label}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        m.bg.replace('/50', ''),
                      )}
                      style={{
                        width: `${Math.min(100, (m.val / m.goal) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs font-semibold mt-1">
                    {m.val}/{m.goal}g
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Progresso Diário - Global Progress */}
      <div className="aero-glass p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="flex items-center gap-2">
              <Utensils className="h-4 w-4" /> Progresso Refeições
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-4 bg-white/50 rounded-full overflow-hidden border border-white/30 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary to-green-400 dark:from-primary dark:to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)] relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent" />
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 blur-[2px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. Hidratação */}
        <div className="space-y-6">
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
        </div>

        {/* 4. Refeições do Dia */}
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
              {todayMeals.map((slot) => {
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

      {/* 5. Ações Rápidas - Quick Actions */}
      <div className="grid grid-cols-2 gap-6 mt-4">
        <GlossyCardButton
          icon={Calendar}
          title="Ver Plano"
          onClick={() => navigate('/plan')}
          className="h-32 active:scale-95 transition-transform"
        />
        <GlossyCardButton
          icon={Scale}
          title="Registrar Peso"
          onClick={() => navigate('/profile')}
          className="h-32 active:scale-95 transition-transform"
        />
      </div>
    </div>
  )
}
