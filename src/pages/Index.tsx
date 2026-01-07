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

export default function Index() {
  const { user, dailyLogs, logWater, getDailyNutrition, mealPlan, recipes } =
    useAppStore()
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
            Mantenha o fluxo. O progresso é líquido.
          </p>
        </div>
      </div>

      {/* Central Water Bubble / Weight Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="aero-glass border-0 relative overflow-hidden min-h-[300px] flex items-center justify-center transition-all duration-700 hover:shadow-2xl">
          <CardContent className="p-6 text-center z-10 w-full">
            <h3 className="text-lg font-semibold mb-6 text-muted-foreground uppercase tracking-widest">
              Status Atual
            </h3>

            {/* The Bubble */}
            <div className="relative mx-auto w-48 h-48">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300/30 to-blue-600/10 backdrop-blur-sm border border-white/40 shadow-[0_0_50px_rgba(59,130,246,0.2)] animate-float flex items-center justify-center group">
                {/* Inner Glare */}
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

              {/* Orbiting Elements */}
              <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80]" />
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold">{nutrition.calories}</p>
                <p className="text-xs text-muted-foreground uppercase">kcal</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {todayLog.waterIntake}
                </p>
                <p className="text-xs text-muted-foreground uppercase">
                  ml Água
                </p>
              </div>
            </div>
          </CardContent>

          {/* Background Gradient Mesh */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 via-transparent to-green-100/20 pointer-events-none" />
        </Card>

        {/* Hydration & Actions */}
        <div className="space-y-6">
          {/* Hydration Control */}
          <Card className="aero-card border-0 bg-blue-50/30 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500 p-2 rounded-full shadow-lg shadow-blue-500/30 text-white">
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
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(100, (todayLog.waterIntake / user.waterGoal) * 100)}%`,
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30" />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1 aero-button bg-red-100/50 hover:bg-red-200/50 text-red-600 border-red-200/50"
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

          {/* Quick Actions with Glossy Icons */}
          <div className="grid grid-cols-2 gap-4">
            <GlossyCardButton
              icon={Calendar}
              title="Ver Plano"
              onClick={() => navigate('/plan')}
            />
            <GlossyCardButton
              icon={Scale}
              title="Registrar Peso"
              onClick={() => navigate('/profile')} // Unified Profile
            />
          </div>
        </div>
      </div>

      {/* Today's Meals */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayMeals.map((slot, index) => {
              const recipe = recipes.find((r) => r.id === slot.recipeId)
              if (!recipe) return null
              return (
                <Link to={`/recipes/${recipe.id}`} key={index}>
                  <div className="aero-card p-3 flex items-center gap-4 group">
                    <img
                      src={recipe.image}
                      className="h-20 w-20 rounded-[16px] object-cover shadow-md group-hover:scale-105 transition-transform duration-500"
                      alt={recipe.title}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-primary font-bold mb-1 uppercase tracking-wider">
                        {slot.type}
                      </p>
                      <p className="font-bold truncate text-lg group-hover:text-primary transition-colors">
                        {recipe.title}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {recipe.calories} kcal • {recipe.prepTime} min
                      </p>
                    </div>
                    <div className="bg-white/50 p-2 rounded-full shadow-sm">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
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
