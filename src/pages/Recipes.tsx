import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RecipeCard } from '@/components/RecipeCard'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const CATEGORIES = ['Todas', 'Salgadas', 'Lanches', 'Sobremesas', 'Drinks']
const DIETARY_FILTERS = [
  'Sem Glúten',
  'Sem Lactose',
  'Vegan',
  'Vegetariano',
  'Low Carb',
  'Proteico',
]

export default function Recipes() {
  const { recipes } = useAppStore()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesCategory =
      selectedCategory === 'Todas' || recipe.category === selectedCategory
    const matchesFilters = activeFilters.every((filter) =>
      recipe.tags.includes(filter),
    )
    return matchesSearch && matchesCategory && matchesFilters
  })

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Search & Filter Bar */}
      <div className="flex gap-3 sticky top-20 z-30 py-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar receitas..."
            className="pl-10 aero-input h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`h-12 w-12 rounded-xl aero-input border-0 ${
                activeFilters.length > 0 ? 'bg-primary/20 text-primary' : ''
              }`}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-[80vh] rounded-t-3xl aero-glass border-t border-white/50"
          >
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">Filtros</SheetTitle>
            </SheetHeader>
            <div className="py-8 space-y-8">
              <div>
                <h4 className="mb-4 text-base font-semibold">
                  Restrições Alimentares
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {DIETARY_FILTERS.map((filter) => (
                    <div
                      key={filter}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 border border-white/20"
                    >
                      <Checkbox
                        id={filter}
                        checked={activeFilters.includes(filter)}
                        onCheckedChange={() => toggleFilter(filter)}
                      />
                      <Label
                        htmlFor={filter}
                        className="font-medium cursor-pointer flex-1"
                      >
                        {filter}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button className="w-full aero-button h-12 text-lg">
                  Ver Resultados
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            className={`rounded-full flex-shrink-0 px-6 backdrop-blur-md transition-all duration-300 ${selectedCategory === cat ? 'aero-button border-0' : 'bg-white/30 border-white/40 hover:bg-white/50'}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="gap-1 pl-3 py-1.5 rounded-full bg-white/40 border border-white/30 backdrop-blur-sm"
            >
              {filter}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                onClick={() => toggleFilter(filter)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-3 rounded-full hover:bg-red-100/50 hover:text-red-500"
            onClick={() => setActiveFilters([])}
          >
            Limpar
          </Button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-20 aero-glass rounded-[30px]">
          <p className="text-muted-foreground font-medium">
            Nenhuma receita encontrada.
          </p>
          <Button
            variant="link"
            onClick={() => {
              setSearch('')
              setActiveFilters([])
              setSelectedCategory('Todas')
            }}
          >
            Limpar busca
          </Button>
        </div>
      )}
    </div>
  )
}
