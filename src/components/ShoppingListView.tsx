import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import {
  CheckCircle2,
  Circle,
  Trash2,
  ShoppingCart,
  Plus,
  X,
  ListRestart,
  ScanBarcode,
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
import { Link } from 'react-router-dom'

export function ShoppingListView() {
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
      const cat = item.category || 'Outros'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
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
      amount: `${newItemQty} ${newItemUnit}`,
      category: 'Outros', // Default category for manual entry
    })

    setNewItemName('')
    setNewItemQty('')
    setIsDialogOpen(false)
    toast.success('Item adicionado!')
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="aero-glass p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-full text-white shadow-lg">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-xl">Lista</h2>
            <p className="text-sm text-muted-foreground font-medium">
              {checkedItems}/{totalItems} itens
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/recipes/scan">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-12 w-12 hover:bg-white/20"
            >
              <ScanBarcode className="h-6 w-6 text-primary" />
            </Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="rounded-full h-12 w-12 aero-button"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="aero-glass">
              <DialogHeader>
                <DialogTitle>Novo Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Item</Label>
                  <Input
                    id="name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Ex: Arroz Integral"
                    className="aero-input"
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
                      className="aero-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                      <SelectTrigger className="aero-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">un</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="pct">pct</SelectItem>
                        <SelectItem value="cx">cx</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full aero-button" onClick={handleAddItem}>
                  Adicionar à Lista
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {totalItems > 0 && (
        <div className="flex justify-end px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearShoppingList}
            className="text-red-500 hover:bg-red-50 rounded-full px-4"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Limpar Lista
          </Button>
        </div>
      )}

      {totalItems === 0 ? (
        <div className="text-center py-16 aero-glass rounded-[30px] border-dashed border-2 border-white/40">
          <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ListRestart className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium mb-6">
            Sua lista está vazia.
          </p>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
            className="aero-button border-0 px-8"
          >
            Começar Lista
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-bold text-primary ml-2 uppercase tracking-wider text-sm sticky top-20 z-20 drop-shadow-sm">
                {category}
              </h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className={`transition-all duration-300 border-0 shadow-sm ${
                      item.checked
                        ? 'bg-white/20 opacity-60 scale-[0.98]'
                        : 'bg-white/60 dark:bg-black/40 backdrop-blur-md hover:scale-[1.01] hover:bg-white/70'
                    }`}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleShoppingItem(item.id)}
                      >
                        {item.checked ? (
                          <CheckCircle2 className="h-7 w-7 text-green-500 flex-shrink-0 drop-shadow-md" />
                        ) : (
                          <Circle className="h-7 w-7 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleShoppingItem(item.id)}
                      >
                        <p
                          className={`font-semibold text-lg ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                        >
                          {item.name}
                        </p>
                      </div>
                      <span className="text-sm font-bold bg-white/50 px-3 py-1.5 rounded-full shadow-inner text-orange-600">
                        {item.amount}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full"
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
    </div>
  )
}
