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
  ChevronLeft,
  ChevronRight,
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
import { ShoppingListContent } from '@/pages/ShoppingList'
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

  // Calculate strict week (Sunday to Saturday)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i),
  )

  const handleAutoGenerate = () => {
    // Generate Strict Weekly Plan (Sun-Sat)
    // Pass the calculated weekStart to ensure strict alignment
    autoGeneratePlan(format(weekStart, 'yyyy-MM-dd'))
    toast.success('Semana planejada magicamente! ✨')
  }

  const getSlots = (date: Date, type: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return mealPlan.filter((s) => s.date === dateStr && s.type === type)
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

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7))
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7))

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between aero-glass p-4">
        <h2 className="text-xl font-bold">Planejamento</h2>
        <div className="flex gap-2">
          {/* Shopping List Overlay Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-white/20">
                <ShoppingCart className="h-4 w-4 mr-2" /> Lista
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[90vh] rounded-t-3xl aero-glass"
            >
              <div className="overflow-y-auto h-full pb-10">
                <ShoppingListContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Magic Button - Minimalist Hat/Wand */}
          <Button
            onClick={handleAutoGenerate}
            size="icon"
            className="rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/30 shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:scale-105 transition-transform"
            title="Gerar Automaticamente"
          >
            <Wand2 className="h-4 w-4 text-white drop-shadow-md" />
          </Button>
        </div>
      </div>

      {/* Improved Mobile Calendar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevWeek}
            className="h-8 w-8 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {format(weekStart, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextWeek}
            className="h-8 w-8 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 px-1">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, currentDate)
            return (
              <button
                key={day.toISOString()}
                onClick={() => setCurrentDate(day)}
                className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-300 aspect-[3/4] ${
                  isSelected
                    ? 'bg-gradient-to-b from-primary to-green-500 dark:from-primary dark:to-cyan-500 text-white shadow-md scale-105'
                    : 'bg-white/30 dark:bg-white/5 text-muted-foreground hover:bg-white/50'
                }`}
              >
                <span className="text-[9px] font-bold uppercase mb-0.5 opacity-80">
                  {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
                </span>
                <span
                  className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-foreground'}`}
                >
                  {format(day, 'd')}
                </span>
              </button>
            )
          })}
        </div>
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
          const slots = getSlots(currentDate, type)

          return (
            <div key={type} className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground ml-2 uppercase tracking-wide opacity-70">
                {type}
              </h4>

              {/* List all items for this slot */}
              {slots.map((slot) => {
                const recipe = recipes.find((r) => r.id === slot.recipeId)
                if (!recipe) return null
                return (
                  <div
                    key={
                      slot.id || `${slot.date}-${slot.type}-${slot.recipeId}`
                    }
                    className="relative group mb-2"
                  >
                    <div className="absolute -right-2 -top-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-full shadow-lg border-2 border-white"
                        onClick={() => removeMealFromPlan(slot.id || '')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <RecipeCard recipe={recipe} />
                  </div>
                )
              })}

              {/* Add Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="w-full h-16 rounded-[20px] border-2 border-dashed border-white/40 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center text-muted-foreground gap-1 group">
                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="h-3 w-3 opacity-70" />
                    </div>
                    <span className="text-[10px] font-medium">
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
