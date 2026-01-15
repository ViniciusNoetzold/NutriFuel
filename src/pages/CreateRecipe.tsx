import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import { Recipe, Ingredient } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateRecipe() {
  const { addRecipe } = useAppStore()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Recipe['category']>('Salgadas')
  const [prepTime, setPrepTime] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [instructionsText, setInstructionsText] = useState('')

  const handleAddIngredient = () => {
    if (!newIngredient || !newAmount) return
    setIngredients([
      ...ingredients,
      {
        name: newIngredient,
        amount: newAmount,
        category: 'Outros', // Default
        calories: Math.floor(Math.random() * 100), // Mock calc
        protein: Math.floor(Math.random() * 10),
        carbs: Math.floor(Math.random() * 10),
        fats: Math.floor(Math.random() * 5),
      },
    ])
    setNewIngredient('')
    setNewAmount('')
  }

  const handleSave = () => {
    if (!title) {
      toast.error('Adicione um título')
      return
    }

    const totalMacros = ingredients.reduce(
      (acc, curr) => ({
        cals: acc.cals + (curr.calories || 0),
        prot: acc.prot + (curr.protein || 0),
        carbs: acc.carbs + (curr.carbs || 0),
        fats: acc.fats + (curr.fats || 0),
      }),
      { cals: 0, prot: 0, carbs: 0, fats: 0 },
    )

    // Process instructions text area into array
    const instructions = instructionsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    const newRecipe: Recipe = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      image: 'https://img.usecurling.com/p/400/300?q=healthy%20food',
      calories: totalMacros.cals || 300, // Fallback if no ingredients
      protein: totalMacros.prot,
      carbs: totalMacros.carbs,
      fats: totalMacros.fats,
      prepTime: Number(prepTime) || 15,
      portions: 1,
      difficulty: 'Fácil',
      category,
      tags: ['Custom'],
      ingredients,
      instructions:
        instructions.length > 0 ? instructions : ['Misturar tudo e servir.'],
      rating: 5,
      isCustom: true,
    }

    addRecipe(newRecipe)
    toast.success('Receita criada com sucesso!')
    navigate('/recipes')
  }

  return (
    <div className="space-y-6 pb-24 px-1">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Criar Receita</h2>
      </div>

      <div className="aero-glass p-6 space-y-4">
        <div className="space-y-2">
          <Label>Título da Receita</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="aero-input"
            placeholder="Ex: Minha Salada Especial"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as any)}
            >
              <SelectTrigger className="aero-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Salgadas">Salgadas</SelectItem>
                <SelectItem value="Lanches">Lanches</SelectItem>
                <SelectItem value="Doces">Doces</SelectItem>
                <SelectItem value="Drinks">Drinks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tempo (min)</Label>
            <Input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="aero-input"
              placeholder="15"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/20">
          <h3 className="font-semibold mb-4">Ingredientes</h3>
          <div className="flex gap-2 mb-4">
            <Input
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Nome"
              className="flex-[2] aero-input"
            />
            <Input
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Qtd"
              className="flex-1 aero-input"
            />
            <Button onClick={handleAddIngredient} className="aero-button">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white/30 p-3 rounded-lg"
              >
                <span>
                  {ing.amount} {ing.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setIngredients(ingredients.filter((_, idx) => idx !== i))
                  }
                  className="text-red-500 hover:bg-red-100/50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {ingredients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhum ingrediente adicionado.
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/20">
          <h3 className="font-semibold mb-2">Forma de Preparo</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Escreva cada passo em uma nova linha.
          </p>
          <Textarea
            value={instructionsText}
            onChange={(e) => setInstructionsText(e.target.value)}
            className="aero-input min-h-[150px]"
            placeholder="1. Lave os ingredientes...&#10;2. Corte tudo..."
          />
        </div>

        <Button
          onClick={handleSave}
          className="w-full h-12 mt-6 aero-button font-bold text-lg"
        >
          <Save className="mr-2 h-5 w-5" /> Salvar Receita
        </Button>
      </div>
    </div>
  )
}
