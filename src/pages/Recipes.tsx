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

// Updated categories to match User Story requirements
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
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex gap-2 sticky top-14 z-30 bg-background/95 pb-2 pt-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar receitas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={
                activeFilters.length > 0 ? 'border-primary text-primary' : ''
              }
            >
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div>
                <h4 className="mb-4 text-sm font-medium leading-none">
                  Restrições Alimentares
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {DIETARY_FILTERS.map((filter) => (
                    <div key={filter} className="flex items-center space-x-2">
                      <Checkbox
                        id={filter}
                        checked={activeFilters.includes(filter)}
                        onCheckedChange={() => toggleFilter(filter)}
                      />
                      <Label htmlFor={filter}>{filter}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button className="w-full">Ver Resultados</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            className="rounded-full flex-shrink-0"
            size="sm"
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
            <Badge key={filter} variant="secondary" className="gap-1 pl-2">
              {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleFilter(filter)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 text-xs px-2"
            onClick={() => setActiveFilters([])}
          >
            Limpar
          </Button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhuma receita encontrada.</p>
        </div>
      )}
    </div>
  )
}
