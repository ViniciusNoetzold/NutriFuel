import { useAppStore } from '@/stores/useAppStore'
import { format } from 'date-fns'
import { Plus, Minus, Droplets, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export default function Index() {
  const { user, dailyLogs, logWater, getDailyNutrition, mealPlan, recipes } =
    useAppStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLog = dailyLogs.find((l) => l.date === today) || { waterIntake: 0 }
  const nutrition = getDailyNutrition(today)
  const caloriesPct = Math.min(
    100,
    Math.round((nutrition.calories / user.calorieGoal) * 100),
  )
  const waterPct = Math.min(
    100,
    Math.round((todayLog.waterIntake / user.waterGoal) * 100),
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
      toast.success('Hidratação registrada!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Hello User */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Olá, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">Vamos manter o foco hoje?</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-0 shadow-elevation bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-slate-300 font-medium">
                Calorias Hoje
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{nutrition.calories}</span>
                <span className="text-slate-400">/ {user.calorieGoal}</span>
              </div>
            </div>
            {/* Simple Circular Progress Representation */}
            <div className="relative h-20 w-20 flex items-center justify-center">
              <svg
                className="h-full w-full -rotate-90 transform"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-slate-700"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeDasharray={`${caloriesPct}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
              <span className="absolute text-sm font-bold">{caloriesPct}%</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400">Proteína</p>
              <p className="font-semibold">{nutrition.protein}g</p>
              <div className="mt-1 h-1 w-full rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: '40%' }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Carbos</p>
              <p className="font-semibold">{nutrition.carbs}g</p>
              <div className="mt-1 h-1 w-full rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: '50%' }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Gorduras</p>
              <p className="font-semibold">{nutrition.fats}g</p>
              <div className="mt-1 h-1 w-full rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: '30%' }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Tracker */}
      <Card className="overflow-hidden border-blue-100 bg-blue-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-blue-900">
            <Droplets className="h-5 w-5 text-blue-500" />
            Hidratação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-blue-700">
              {todayLog.waterIntake}ml
            </span>
            <span className="text-sm text-blue-500">
              Meta: {user.waterGoal}ml
            </span>
          </div>
          <Progress value={waterPct} className="h-3 bg-blue-200" />
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              onClick={() => handleWater(-250)}
              disabled={todayLog.waterIntake <= 0}
            >
              <Minus className="h-4 w-4 mr-1" /> 250ml
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              onClick={() => handleWater(250)}
            >
              <Plus className="h-4 w-4 mr-1" /> 250ml
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Plan */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Refeições de Hoje</h3>
          <Link
            to="/plan"
            className="text-sm text-primary hover:underline flex items-center"
          >
            Ver tudo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {todayMeals.length > 0 ? (
          <div className="space-y-3">
            {todayMeals.map((slot, index) => {
              const recipe = recipes.find((r) => r.id === slot.recipeId)
              if (!recipe) return null
              return (
                <Link to={`/recipes/${recipe.id}`} key={index}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all cursor-pointer mb-3">
                    <img
                      src={recipe.image}
                      className="h-16 w-16 rounded-lg object-cover"
                      alt={recipe.title}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">
                        {slot.type}
                      </p>
                      <p className="font-semibold truncate">{recipe.title}</p>
                      <p className="text-xs text-orange-600 font-medium">
                        {recipe.calories} kcal
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground text-sm mb-3">
              Nenhuma refeição planejada.
            </p>
            <Link to="/plan">
              <Button variant="outline" size="sm">
                Planejar dia
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
