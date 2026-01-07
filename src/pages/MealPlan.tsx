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
  Filter,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
    toast.success('Plano semanal gerado com sucesso!')
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

  // Filter available recipes for adding to plan
  const filteredRecipes = recipes.filter(
    (recipe) =>
      activeFilters.length === 0 ||
      activeFilters.every((f) => recipe.tags.includes(f)),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Planejamento</h2>
        <div className="flex gap-2">
          <Link to="/shop">
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" /> Lista
            </Button>
          </Link>
          <Button
            onClick={handleAutoGenerate}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Wand2 className="mr-2 h-4 w-4" /> Mágica
          </Button>
        </div>
      </div>

      {/* Filters for planning */}
      <div className="flex gap-2 items-center overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Preferências:
        </span>
        {DIETARY_FILTERS.map((filter) => (
          <Badge
            key={filter}
            variant={activeFilters.includes(filter) ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => toggleFilter(filter)}
          >
            {filter}
          </Badge>
        ))}
      </div>

      {/* Week Strip */}
      <div className="flex justify-between overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, currentDate)
          return (
            <button
              key={day.toISOString()}
              onClick={() => setCurrentDate(day)}
              className={`flex flex-col items-center min-w-[3.5rem] p-2 rounded-xl transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md scale-105'
                  : 'bg-card text-muted-foreground'
              }`}
            >
              <span className="text-xs font-medium uppercase">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span className="text-lg font-bold">{format(day, 'd')}</span>
            </button>
          )
        })}
      </div>

      {/* Daily Plan */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span className="font-semibold capitalize">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>

        {MEAL_TYPES.map((type) => {
          const slot = getSlot(currentDate, type)
          const recipe = slot
            ? recipes.find((r) => r.id === slot.recipeId)
            : null

          return (
            <div key={type} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {type}
              </h4>
              {recipe ? (
                <div className="relative group">
                  <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full shadow-md"
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
                    <button className="w-full h-24 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 transition-colors">
                      <Plus className="h-6 w-6 mb-1 opacity-50" />
                      <span className="text-sm">Adicionar {type}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="h-[85vh] rounded-t-3xl flex flex-col"
                  >
                    <SheetHeader className="pb-4">
                      <SheetTitle>Escolher Receita</SheetTitle>
                      {activeFilters.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Filtrando por: {activeFilters.join(', ')}
                        </p>
                      )}
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
                          Nenhuma receita encontrada com os filtros atuais.
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
