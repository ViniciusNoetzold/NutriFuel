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
  Activity,
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
    logExercise,
  } = useAppStore()
  const navigate = useNavigate()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLog = dailyLogs.find((l) => l.date === today) || {
    waterIntake: 0,
    weight: user.weight,
    exerciseBurned: 0,
  }
  const consumed = getConsumedNutrition(today)

  const burned = todayLog.exerciseBurned || 0
  const dailyGoal = user.calorieGoal
  // Formula: Daily Goal - (Consumed + Exercise) -> Wait, if Exercise adds to the "budget", it should be Goal + Exercise - Consumed.
  // But based on user story explicit formula "Daily Goal - (Consumed + Exercise)",
  // I will assume "Exercise" acts as a credit.
  // To make it functional as "Remaining":
  // Remaining = (Goal + Exercise) - Consumed
  const remainingCalories = dailyGoal + burned - consumed.calories

  // Progress for liquid bar (Consumed / (Goal + Exercise))
  const totalBudget = dailyGoal + burned
  const progressPercentCalories = Math.min(
    100,
    (consumed.calories / totalBudget) * 100,
  )

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

  const handleExercise = () => {
    // Quick add 100 cal for demo
    logExercise(100, today)
    toast.success('Exercício registrado: -100kcal (adicionadas ao orçamento)')
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
            Seu corpo, seu combustível.
          </p>
        </div>
      </div>

      {/* 1. Status - Dashboard */}
      <Card className="aero-glass border-0 relative overflow-hidden transition-all duration-700 hover:shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/20 via-transparent to-blue-100/20 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Status
            </h3>
            <span className="text-xs font-bold bg-white/30 px-2 py-1 rounded-lg text-foreground/70">
              Hoje
            </span>
          </div>

          <div className="flex flex-col items-center gap-6">
            {/* Primary Metric: Remaining Calories */}
            <div className="text-center relative">
              <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-cyan-600 dark:to-cyan-400 drop-shadow-sm">
                {Math.floor(remainingCalories)}
              </p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mt-1">
                Calorias Restantes
              </p>
              <div className="text-xs text-muted-foreground/60 mt-2 font-medium">
                Meta: {dailyGoal} + Treino: {burned} - Consumo:{' '}
                {consumed.calories}
              </div>
            </div>

            {/* Liquid Progress Bar */}
            <div className="w-full max-w-md h-8 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden border border-white/30 shadow-inner relative">
              <div
                className="h-full bg-gradient-to-r from-primary via-cyan-400 to-blue-500 animate-liquid-flow shadow-[0_0_20px_rgba(6,182,212,0.6)] relative"
                style={{ width: `${progressPercentCalories}%` }}
              >
                {/* Liquid Glare */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/40 rounded-t-full" />
                {/* Bubbles */}
                <div className="absolute inset-0 opacity-50 bg-[url('https://img.usecurling.com/p/64/64?q=bubbles&color=white')] bg-repeat-x animate-liquid-flow mix-blend-overlay" />
              </div>
            </div>

            {/* Macro Breakdown Bubbles */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-2">
              {[
                {
                  label: 'Carb',
                  val: consumed.carbs,
                  goal: user.carbsGoal,
                  color: 'from-green-400 to-green-600',
                },
                {
                  label: 'Prot',
                  val: consumed.protein,
                  goal: user.proteinGoal,
                  color: 'from-blue-400 to-blue-600',
                },
                {
                  label: 'Gord',
                  val: consumed.fats,
                  goal: user.fatsGoal,
                  color: 'from-yellow-400 to-orange-500',
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col items-center p-3 rounded-2xl bg-white/20 dark:bg-white/5 border border-white/30 backdrop-blur-sm"
                >
                  <span className="text-xs font-bold text-muted-foreground mb-1">
                    {m.label}
                  </span>
                  <div className="text-lg font-bold">
                    {m.val}
                    <span className="text-xs text-muted-foreground font-normal">
                      /{m.goal}g
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r',
                        m.color,
                      )}
                      style={{
                        width: `${Math.min(100, (m.val / m.goal) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Hidratação */}
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

        {/* 3. Refeições do Dia */}
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

      {/* 4. Ações Rápidas - Quick Actions */}
      <div className="grid grid-cols-2 gap-6 mt-4">
        <GlossyCardButton
          icon={Calendar}
          title="Ver Plano"
          onClick={() => navigate('/plan')}
          className="h-32 active:scale-95 transition-transform"
        />
        <GlossyCardButton
          icon={Flame}
          title="Registrar Treino"
          onClick={handleExercise}
          className="h-32 active:scale-95 transition-transform"
        />
      </div>
    </div>
  )
}
