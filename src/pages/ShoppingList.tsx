import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import {
  CheckCircle2,
  Circle,
  Trash2,
  ShoppingCart,
  Plus,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function ShoppingList() {
  const {
    shoppingList,
    toggleShoppingItem,
    clearShoppingList,
    removeShoppingItem,
    addShoppingItem,
  } = useAppStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form State
  const [newItemName, setNewItemName] = useState('')
  const [newItemQty, setNewItemQty] = useState('')
  const [newItemUnit, setNewItemUnit] = useState('un')

  // Group by category
  const grouped = shoppingList.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof shoppingList>,
  )

  const totalItems = shoppingList.length
  const checkedItems = shoppingList.filter((i) => i.checked).length

  const handleAddItem = () => {
    if (!newItemName || !newItemQty) {
      toast.error('Preencha o nome e a quantidade')
      return
    }

    addShoppingItem({
      name: newItemName,
      amount: `${newItemQty}${newItemUnit}`,
      category: 'Outros', // Default category for manual entry
    })

    setNewItemName('')
    setNewItemQty('')
    setIsDialogOpen(false)
    toast.success('Item adicionado!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-primary/10 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-full text-primary-foreground">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-lg">Lista de Compras</p>
            <p className="text-sm text-muted-foreground">
              {checkedItems} de {totalItems} itens comprados
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {checkedItems > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearShoppingList}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Item</Label>
                  <Input
                    id="name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Ex: Arroz Integral"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qty">Quantidade</Label>
                    <Input
                      id="qty"
                      type="number"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">un</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="pct">pacote</SelectItem>
                        <SelectItem value="cx">caixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddItem}>
                  Adicionar à Lista
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Sua lista está vazia.</p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            Adicionar Item
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold text-primary mb-3 sticky top-14 bg-background z-10 py-2 border-b">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className={`transition-all duration-200 ${item.checked ? 'bg-muted/50 opacity-60' : 'bg-card'}`}
                  >
                    <div className="p-3 flex items-center gap-3">
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleShoppingItem(item.id)}
                      >
                        {item.checked ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleShoppingItem(item.id)}
                      >
                        <p
                          className={`font-medium ${item.checked ? 'line-through' : ''}`}
                        >
                          {item.name}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium bg-secondary/10 px-2 py-1 rounded text-orange-600">
                        {item.amount}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeShoppingItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Spacer for bottom nav */}
      <div className="h-20" />
    </div>
  )
}
