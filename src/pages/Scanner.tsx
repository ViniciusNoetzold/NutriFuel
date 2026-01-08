import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ScanLine, Search, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/stores/useAppStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScannedProduct } from '@/lib/types'

export default function Scanner() {
  const navigate = useNavigate()
  const { addScannedProduct, scannedHistory, addShoppingItem } = useAppStore()
  const [scanning, setScanning] = useState(true)
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(
    null,
  )

  // Mock scan logic
  const handleScan = () => {
    // Simulate finding a product after 1.5s
    setTimeout(() => {
      const mockProduct: ScannedProduct = {
        code: '7891000055',
        name: 'Iogurte Grego Light',
        brand: 'NutriDairy',
        calories: 90,
        protein: 12,
        carbs: 8,
        fats: 2.5,
        image: 'https://img.usecurling.com/p/200/200?q=yogurt%20container',
        dateScanned: new Date().toISOString(),
      }
      setScannedProduct(mockProduct)
      addScannedProduct(mockProduct)
      setScanning(false)
      toast.success('Código de barras identificado!')
    }, 1000)
  }

  const handleAddToShoppingList = () => {
    if (scannedProduct) {
      addShoppingItem({
        name: scannedProduct.name,
        amount: '1 un',
        category: 'Laticínios',
      })
      toast.success('Adicionado à lista de compras!')
      setScannedProduct(null)
      setScanning(true)
    }
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col relative bg-black/90 rounded-[30px] overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/20 rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {/* Mock Camera View */}
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/400/800?q=supermarket%20shelf&blur=2')] bg-cover opacity-50" />

        {/* Scanning Frame */}
        {scanning && (
          <div className="relative z-10 w-64 h-48 border-2 border-white/50 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-red-500 shadow-[0_0_10px_red] animate-[scan_2s_ease-in-out_infinite]" />
            <div className="corner-border top-0 left-0 border-l-4 border-t-4 border-white w-4 h-4 absolute rounded-tl-sm" />
            <div className="corner-border top-0 right-0 border-r-4 border-t-4 border-white w-4 h-4 absolute rounded-tr-sm" />
            <div className="corner-border bottom-0 left-0 border-l-4 border-b-4 border-white w-4 h-4 absolute rounded-bl-sm" />
            <div className="corner-border bottom-0 right-0 border-r-4 border-b-4 border-white w-4 h-4 absolute rounded-br-sm" />
            <ScanLine className="h-12 w-12 text-white/50 animate-pulse" />
          </div>
        )}

        <p className="absolute bottom-32 text-white/80 text-sm font-medium text-center px-8">
          Aponte a câmera para o código de barras
        </p>

        <div className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-4">
          <Button
            size="lg"
            className="h-16 w-16 rounded-full border-4 border-white bg-transparent hover:bg-white/20"
            onClick={handleScan}
          >
            <div className="w-12 h-12 bg-white rounded-full" />
          </Button>

          {/* Recent Scans */}
          {scannedHistory.length > 0 && (
            <div className="w-full px-4 overflow-x-auto">
              <div className="flex gap-2">
                {scannedHistory.slice(0, 5).map((prod, idx) => (
                  <div
                    key={idx}
                    className="bg-black/40 backdrop-blur-md p-2 rounded-xl flex items-center gap-2 text-white border border-white/10 w-40 flex-shrink-0 cursor-pointer"
                    onClick={() => setScannedProduct(prod)}
                  >
                    <img
                      src={prod.image}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{prod.name}</p>
                      <p className="text-[10px] text-gray-300">
                        {prod.calories}kcal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal (Glassmorphism) */}
      <Dialog
        open={!!scannedProduct}
        onOpenChange={(val) => !val && setScannedProduct(null)}
      >
        <DialogContent className="aero-glass border-white/20">
          <DialogHeader>
            <DialogTitle>Produto Identificado</DialogTitle>
          </DialogHeader>
          {scannedProduct && (
            <div className="flex flex-col gap-4 items-center">
              <img
                src={scannedProduct.image}
                className="w-32 h-32 rounded-xl shadow-lg object-cover border-2 border-white/50"
              />
              <div className="text-center">
                <h3 className="text-xl font-bold">{scannedProduct.name}</h3>
                <p className="text-muted-foreground">{scannedProduct.brand}</p>
              </div>

              <div className="grid grid-cols-4 gap-2 w-full">
                {[
                  {
                    l: 'Cal',
                    v: scannedProduct.calories,
                    c: 'bg-orange-100 text-orange-700',
                  },
                  {
                    l: 'Prot',
                    v: scannedProduct.protein + 'g',
                    c: 'bg-blue-100 text-blue-700',
                  },
                  {
                    l: 'Carb',
                    v: scannedProduct.carbs + 'g',
                    c: 'bg-green-100 text-green-700',
                  },
                  {
                    l: 'Gord',
                    v: scannedProduct.fats + 'g',
                    c: 'bg-yellow-100 text-yellow-700',
                  },
                ].map((m, i) => (
                  <div key={i} className={`rounded-lg p-2 text-center ${m.c}`}>
                    <p className="text-[10px] font-bold uppercase">{m.l}</p>
                    <p className="font-bold text-sm">{m.v}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 w-full mt-2">
                <Button
                  className="flex-1 aero-button"
                  onClick={handleAddToShoppingList}
                >
                  <Plus className="h-4 w-4 mr-2" /> Comprar
                </Button>
                <Button
                  className="flex-1 aero-button"
                  onClick={() => {
                    toast.success('Adicionado ao diário!')
                    setScannedProduct(null)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Comer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes scan {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
