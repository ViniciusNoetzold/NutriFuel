import { useAppStore } from '@/stores/useAppStore'
import { CheckCircle2, Circle, Trash2, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ShoppingList() {
  const { shoppingList, toggleShoppingItem, clearShoppingList } = useAppStore()

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
      </div>

      {totalItems === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Sua lista está vazia.</p>
          <p className="text-sm text-muted-foreground">
            Adicione refeições ao seu plano para gerar a lista automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold text-primary mb-3 sticky top-14 bg-background z-10 py-2">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className={`transition-all duration-200 ${item.checked ? 'bg-muted/50 opacity-60' : 'bg-card'}`}
                    onClick={() => toggleShoppingItem(item.id)}
                  >
                    <div className="p-3 flex items-center gap-3 cursor-pointer">
                      {item.checked ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p
                          className={`font-medium ${item.checked ? 'line-through' : ''}`}
                        >
                          {item.name}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium bg-secondary/10 px-2 py-1 rounded text-orange-600">
                        {item.amount}
                      </span>
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
