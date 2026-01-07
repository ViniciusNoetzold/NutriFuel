import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Wand2,
  Plus,
  Calendar as CalendarIcon,
  X,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { RecipeCard } from '@/components/RecipeCard'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

const MEAL_TYPES = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'] as const
const DIETARY_FILTERS = [
  'Sem Glúten',
  'Sem Lactose',
  'Vegan',
  'Vegetariano',
  'Low Carb',
]

export default function MealPlan() {
  const {
    mealPlan,
    autoGeneratePlan,
    removeMealFromPlan,
    recipes,
    addMealToPlan,
  } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })

  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(startDate, i),
  )

  const handleAutoGenerate = () => {
    autoGeneratePlan(format(startDate, 'yyyy-MM-dd'))
    toast.success('Semana planejada magicamente! ✨')
  }

  const getSlot = (date: Date, type: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return mealPlan.find((s) => s.date === dateStr && s.type === type)
  }

  const handleAddMeal = (date: Date, type: string, recipeId: string) => {
    addMealToPlan(format(date, 'yyyy-MM-dd'), type as any, recipeId)
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    )
  }

  const filteredRecipes = recipes.filter(
    (recipe) =>
      activeFilters.length === 0 ||
      activeFilters.every((f) => recipe.tags.includes(f)),
  )

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between aero-glass p-4">
        <h2 className="text-xl font-bold">Planejamento</h2>
        <div className="flex gap-2">
          <Link to="/shop">
            <Button variant="ghost" size="sm" className="hover:bg-white/20">
              <ShoppingCart className="h-4 w-4 mr-2" /> Lista
            </Button>
          </Link>
          <Button
            onClick={handleAutoGenerate}
            size="sm"
            className="aero-button bg-indigo-500 text-white border-white/30"
          >
            <Wand2 className="mr-2 h-4 w-4" /> Mágica
          </Button>
        </div>
      </div>

      {/* Week Strip */}
      <div className="flex justify-between overflow-x-auto pb-4 pt-2 -mx-4 px-4 scrollbar-hide snap-x">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, currentDate)
          return (
            <button
              key={day.toISOString()}
              onClick={() => setCurrentDate(day)}
              className={`snap-center flex flex-col items-center min-w-[4rem] p-3 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-b from-primary to-blue-500 text-white shadow-lg scale-110'
                  : 'bg-white/40 dark:bg-black/40 backdrop-blur-md text-muted-foreground hover:bg-white/60'
              }`}
            >
              <span className="text-xs font-semibold uppercase mb-1">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span className="text-xl font-bold">{format(day, 'd')}</span>
            </button>
          )
        })}
      </div>

      {/* Daily Plan */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2 px-2">
          <div className="p-2 bg-primary/20 rounded-xl text-primary">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg capitalize text-shadow-sm">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>

        {MEAL_TYPES.map((type) => {
          const slot = getSlot(currentDate, type)
          const recipe = slot
            ? recipes.find((r) => r.id === slot.recipeId)
            : null

          return (
            <div key={type} className="space-y-3">
              <h4 className="text-sm font-bold text-muted-foreground ml-2 uppercase tracking-wide opacity-70">
                {type}
              </h4>
              {recipe ? (
                <div className="relative group">
                  <div className="absolute -right-2 -top-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full shadow-lg border-2 border-white"
                      onClick={() => removeMealFromPlan(slot!.date, slot!.type)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <RecipeCard recipe={recipe} />
                </div>
              ) : (
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="w-full h-32 rounded-[24px] border-2 border-dashed border-white/40 bg-white/10 hover:bg-white/20 transition-all flex flex-col items-center justify-center text-muted-foreground gap-2 group">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="h-5 w-5 opacity-70" />
                      </div>
                      <span className="text-sm font-medium">
                        Adicionar {type}
                      </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="h-[85vh] rounded-t-3xl aero-glass flex flex-col"
                  >
                    <SheetHeader className="pb-4">
                      <SheetTitle>Escolher para {type}</SheetTitle>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {DIETARY_FILTERS.map((filter) => (
                          <Badge
                            key={filter}
                            variant={
                              activeFilters.includes(filter)
                                ? 'default'
                                : 'outline'
                            }
                            className="cursor-pointer whitespace-nowrap"
                            onClick={() => toggleFilter(filter)}
                          >
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
                      {filteredRecipes.length > 0 ? (
                        filteredRecipes.map((r) => (
                          <RecipeCard
                            key={r.id}
                            recipe={r}
                            onAdd={() => {
                              handleAddMeal(currentDate, type, r.id)
                              document.dispatchEvent(
                                new KeyboardEvent('keydown', { key: 'Escape' }),
                              )
                              toast.success('Adicionado!')
                            }}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                          Nenhuma receita encontrada.
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
