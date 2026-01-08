import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import {
  Clock,
  Users,
  Flame,
  ChefHat,
  Heart,
  Share2,
  Plus,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { format } from 'date-fns'
import { Slider } from '@/components/ui/slider'
import { MealType } from '@/lib/types'

const MEAL_TYPES: MealType[] = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar']

export default function RecipeDetail() {
  const { id } = useParams()
  const {
    recipes,
    addMealToPlan,
    addIngredientsToShoppingList,
    toggleFavorite,
  } = useAppStore()
  const navigate = useNavigate()
  const recipe = recipes.find((r) => r.id === id)

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd'),
  )
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([
    'Almoço',
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [portionScale, setPortionScale] = useState(1)

  if (!recipe) {
    return <div className="p-8 text-center">Receita não encontrada.</div>
  }

  const handleAddToPlan = () => {
    if (selectedMealTypes.length === 0) {
      toast.error('Selecione pelo menos um tipo de refeição.')
      return
    }

    selectedMealTypes.forEach((type) => {
      addMealToPlan(selectedDate, type, recipe.id)
    })

    // Confetti logic could be here, implementing simple toast for now
    toast.success(`${recipe.title} adicionado ao plano!`, {
      description: 'Refeição registrada com sucesso.',
    })
    setIsDialogOpen(false)
  }

  const handleToggleIngredient = (name: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
    )
  }

  const handleAddIngredientsToShop = () => {
    const ingredientsToAdd = recipe.ingredients.filter((ing) =>
      selectedIngredients.includes(ing.name),
    )

    if (ingredientsToAdd.length === 0) {
      toast.error('Selecione pelo menos um ingrediente.')
      return
    }

    addIngredientsToShoppingList(ingredientsToAdd)
    toast.success(
      `${ingredientsToAdd.length} itens adicionados à lista de compras!`,
    )
    setSelectedIngredients([])
  }

  const toggleMealType = (type: MealType) => {
    setSelectedMealTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  // Calculated macros
  const calories = Math.round(recipe.calories * portionScale)
  const protein = Math.round(recipe.protein * portionScale)
  const carbs = Math.round(recipe.carbs * portionScale)
  const fats = Math.round(recipe.fats * portionScale)

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 rounded-[30px] overflow-hidden shadow-2xl mx-[-1rem] md:mx-0">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex gap-2 mb-3">
            <Badge className="bg-primary/80 backdrop-blur-md border border-white/20 text-white">
              {recipe.category}
            </Badge>
            {recipe.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-white/40 text-white/90 bg-black/20 backdrop-blur-md"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2 text-shadow-lg">
            {recipe.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-200 font-medium">
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-400" /> {calories} kcal
            </span>
            <span className="w-1 h-1 bg-white/50 rounded-full" />
            <span>{recipe.difficulty}</span>
          </div>
        </div>
      </div>

      <div className="px-1">
        {/* Macros - Dynamic based on portion */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            {
              label: 'Calorias',
              val: calories,
              unit: 'kcal',
              color: 'bg-orange-100 text-orange-700',
            },
            {
              label: 'Proteína',
              val: protein,
              unit: 'g',
              color: 'bg-blue-100 text-blue-700',
            },
            {
              label: 'Carbos',
              val: carbs,
              unit: 'g',
              color: 'bg-green-100 text-green-700',
            },
            {
              label: 'Gorduras',
              val: fats,
              unit: 'g',
              color: 'bg-yellow-100 text-yellow-700',
            },
          ].map((macro) => (
            <div
              key={macro.label}
              className="aero-glass p-3 text-center flex flex-col justify-center min-h-[80px]"
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">
                {macro.label}
              </p>
              <p className="font-bold text-xl text-foreground">
                {macro.val}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">
                  {macro.unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between py-6 px-4 aero-glass mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100/50 rounded-full text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">
                Tempo
              </p>
              <p className="font-bold">{recipe.prepTime} min</p>
            </div>
          </div>
          <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100/50 rounded-full text-green-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">
                Porções
              </p>
              <p className="font-bold">
                {(recipe.portions * portionScale).toFixed(1)} pes.
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100/50 rounded-full text-purple-600">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">
                Nível
              </p>
              <p className="font-bold">{recipe.difficulty}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 text-base aero-button col-span-2 sm:col-span-1">
                <Plus className="mr-2 h-5 w-5" /> Adicionar ao Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="aero-glass">
              <DialogHeader>
                <DialogTitle>Planejar Refeição</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <input
                    type="date"
                    className="flex h-12 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm ring-offset-background backdrop-blur-sm"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Refeição (Multipla Escolha)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {MEAL_TYPES.map((type) => (
                      <div
                        key={type}
                        className="flex items-center space-x-2 p-3 bg-white/40 dark:bg-white/10 rounded-xl"
                      >
                        <Checkbox
                          id={type}
                          checked={selectedMealTypes.includes(type)}
                          onCheckedChange={() => toggleMealType(type)}
                        />
                        <Label htmlFor={type} className="cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Ajustar Porção</Label>
                    <span className="text-sm font-bold text-primary">
                      {portionScale.toFixed(1)}x
                    </span>
                  </div>
                  <Slider
                    defaultValue={[1]}
                    max={3}
                    min={0.5}
                    step={0.1}
                    value={[portionScale]}
                    onValueChange={(val) => setPortionScale(val[0])}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Os macros serão recalculados automaticamente.
                  </p>
                </div>

                <Button
                  className="w-full aero-button"
                  onClick={handleAddToPlan}
                >
                  Confirmar Agendamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex gap-4 col-span-2 sm:col-span-1">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-14 rounded-2xl border-white/40 bg-white/30 backdrop-blur-md hover:bg-white/50"
              onClick={() => toggleFavorite(recipe.id)}
            >
              <Heart
                className={cn(
                  'h-5 w-5',
                  recipe.isFavorite && 'fill-red-500 text-red-500',
                )}
              />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-14 rounded-2xl border-white/40 bg-white/30 backdrop-blur-md hover:bg-white/50"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs - Updated for Better Legibility in Dark Mode */}
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-14 p-1 bg-black/10 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
            <TabsTrigger
              value="ingredients"
              className="h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/90 data-[state=active]:text-black data-[state=active]:shadow-sm font-bold transition-all"
            >
              Ingredientes
            </TabsTrigger>
            <TabsTrigger
              value="method"
              className="h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/90 data-[state=active]:text-black data-[state=active]:shadow-sm font-bold transition-all"
            >
              Preparo
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="ingredients"
            className="space-y-4 animate-fade-in-up"
          >
            <div className="flex justify-between items-center mb-4 px-1">
              <p className="text-sm font-medium text-muted-foreground">
                Marque para adicionar à lista
              </p>
              {selectedIngredients.length > 0 && (
                <Button
                  size="sm"
                  className="aero-button h-8 text-xs"
                  onClick={handleAddIngredientsToShop}
                >
                  <ShoppingCart className="h-3 w-3 mr-2" /> Adicionar (
                  {selectedIngredients.length})
                </Button>
              )}
            </div>
            <div className="grid gap-3">
              {recipe.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center p-4 rounded-2xl border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm gap-4 transition-all hover:bg-white/60 dark:hover:bg-white/10"
                >
                  <Checkbox
                    id={`ing-${i}`}
                    checked={selectedIngredients.includes(ing.name)}
                    onCheckedChange={() => handleToggleIngredient(ing.name)}
                    className="h-6 w-6 rounded-full border-2"
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <Label
                      htmlFor={`ing-${i}`}
                      className="font-semibold text-base cursor-pointer"
                    >
                      {ing.name}
                    </Label>
                    <span className="text-muted-foreground font-medium bg-white/30 dark:bg-white/10 px-3 py-1 rounded-full text-sm">
                      {ing.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="method" className="space-y-6 animate-fade-in-up">
            <div className="aero-glass p-6">
              {recipe.instructions.map((step, i) => (
                <div key={i} className="flex gap-6 mb-8 last:mb-0 relative">
                  <div className="flex-none h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg flex items-center justify-center font-bold text-lg z-10">
                    {i + 1}
                  </div>
                  {i !== recipe.instructions.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-32px] w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
                  )}
                  <p className="text-foreground/90 leading-relaxed pt-1 text-lg font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
