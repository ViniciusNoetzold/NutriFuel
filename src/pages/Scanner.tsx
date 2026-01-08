import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Camera, ScanLine } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/stores/useAppStore'

export default function Scanner() {
  const navigate = useNavigate()
  const { addMealToPlan } = useAppStore()
  const [scanning, setScanning] = useState(true)

  const handleScan = () => {
    // Mock successful scan
    setScanning(false)
    toast.success('Produto identificado: Iogurte Grego Light (90kcal)')

    // Mock adding to today's lunch for demo purposes
    // In a real app, we would show a confirmation dialog
    setTimeout(() => {
      navigate('/plan')
    }, 1500)
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
        <div className="relative z-10 w-64 h-48 border-2 border-white/50 rounded-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-red-500 shadow-[0_0_10px_red] animate-[scan_2s_ease-in-out_infinite]" />
          <div className="corner-border top-0 left-0 border-l-4 border-t-4 border-white w-4 h-4 absolute rounded-tl-sm" />
          <div className="corner-border top-0 right-0 border-r-4 border-t-4 border-white w-4 h-4 absolute rounded-tr-sm" />
          <div className="corner-border bottom-0 left-0 border-l-4 border-b-4 border-white w-4 h-4 absolute rounded-bl-sm" />
          <div className="corner-border bottom-0 right-0 border-r-4 border-b-4 border-white w-4 h-4 absolute rounded-br-sm" />
          <ScanLine className="h-12 w-12 text-white/50 animate-pulse" />
        </div>

        <p className="absolute bottom-32 text-white/80 text-sm font-medium text-center px-8">
          Aponte a câmera para o código de barras
        </p>

        <div className="absolute bottom-10 inset-x-0 flex justify-center">
          <Button
            size="lg"
            className="h-16 w-16 rounded-full border-4 border-white bg-transparent hover:bg-white/20"
            onClick={handleScan}
          >
            <div className="w-12 h-12 bg-white rounded-full" />
          </Button>
        </div>
      </div>
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
