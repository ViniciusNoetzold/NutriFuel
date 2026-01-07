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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { format } from 'date-fns'

export default function RecipeDetail() {
  const { id } = useParams()
  const { recipes, addMealToPlan, addIngredientsToShoppingList } = useAppStore()
  const navigate = useNavigate()
  const recipe = recipes.find((r) => r.id === id)

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd'),
  )
  const [selectedMealType, setSelectedMealType] = useState<string>('Almoço')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])

  if (!recipe) {
    return <div className="p-8 text-center">Receita não encontrada.</div>
  }

  const handleAddToPlan = () => {
    addMealToPlan(selectedDate, selectedMealType as any, recipe.id)
    toast.success(`${recipe.title} adicionado ao plano!`)
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

  return (
    <div className="space-y-6 -mx-4 md:mx-0">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 md:rounded-2xl overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <Badge className="mb-2 bg-primary hover:bg-primary border-0">
            {recipe.category}
          </Badge>
          <h1 className="text-3xl font-bold leading-tight mb-1">
            {recipe.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4" /> {recipe.calories} kcal
            </span>
            <span>•</span>
            <span>{recipe.difficulty}</span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0">
        {/* Macros */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Calorias', val: recipe.calories, unit: 'kcal' },
            { label: 'Proteína', val: recipe.protein, unit: 'g' },
            { label: 'Carbos', val: recipe.carbs, unit: 'g' },
            { label: 'Gorduras', val: recipe.fats, unit: 'g' },
          ].map((macro) => (
            <div
              key={macro.label}
              className="bg-muted/50 p-3 rounded-xl text-center"
            >
              <p className="text-xs text-muted-foreground mb-1">
                {macro.label}
              </p>
              <p className="font-bold text-foreground">
                {macro.val}
                <span className="text-xs font-normal text-muted-foreground">
                  {macro.unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between py-4 border-y border-border/50 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Tempo</p>
              <p className="font-medium">{recipe.prepTime} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Porções</p>
              <p className="font-medium">{recipe.portions} pes.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Dificuldade</p>
              <p className="font-medium">{recipe.difficulty}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Plus className="mr-2 h-5 w-5" /> Adicionar ao Plano
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar ao Plano</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Refeição</Label>
                  <Select
                    value={selectedMealType}
                    onValueChange={setSelectedMealType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Café da Manhã">
                        Café da Manhã
                      </SelectItem>
                      <SelectItem value="Almoço">Almoço</SelectItem>
                      <SelectItem value="Lanche">Lanche</SelectItem>
                      <SelectItem value="Jantar">Jantar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleAddToPlan}>
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="flex-1">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
            <TabsTrigger value="method">Preparo</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">
                Selecione para comprar
              </p>
              {selectedIngredients.length > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAddIngredientsToShop}
                >
                  <ShoppingCart className="h-3 w-3 mr-2" /> Adicionar (
                  {selectedIngredients.length})
                </Button>
              )}
            </div>
            {recipe.ingredients.map((ing, i) => (
              <div
                key={i}
                className="flex items-center p-3 rounded-lg border bg-card gap-3"
              >
                <Checkbox
                  id={`ing-${i}`}
                  checked={selectedIngredients.includes(ing.name)}
                  onCheckedChange={() => handleToggleIngredient(ing.name)}
                />
                <div className="flex-1 flex justify-between items-center">
                  <Label
                    htmlFor={`ing-${i}`}
                    className="font-medium cursor-pointer"
                  >
                    {ing.name}
                  </Label>
                  <span className="text-muted-foreground text-sm">
                    {ing.amount}
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="method" className="space-y-6">
            {recipe.instructions.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-none h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-muted-foreground leading-relaxed pt-1">
                  {step}
                </p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
