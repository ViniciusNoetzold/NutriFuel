import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Share2, Upload, ArrowLeft, Camera, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores/useAppStore'
import { format } from 'date-fns'

export default function Evolution() {
  const navigate = useNavigate()
  const { dailyLogs } = useAppStore()
  const [beforeImage, setBeforeImage] = useState<string | null>(null)
  const [afterImage, setAfterImage] = useState<string | null>(null)
  const [activeSlot, setActiveSlot] = useState<'before' | 'after' | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSlotClick = (slot: 'before' | 'after') => {
    setActiveSlot(slot)
    setIsDialogOpen(true)
  }

  const handleSelectImage = (src: string) => {
    if (activeSlot === 'before') setBeforeImage(src)
    else setAfterImage(src)
    setIsDialogOpen(false)
    toast.success('Foto atualizada!')
  }

  const handleUploadNew = () => {
    // Simulating file upload
    const mockImage = `https://img.usecurling.com/ppl/medium?gender=female&seed=${Math.random()}`
    handleSelectImage(mockImage)
  }

  const handleShare = () => {
    toast.success('Card gerado! Compartilhando...')
  }

  const historyPhotos = dailyLogs
    .filter((l) => l.photo)
    .map((l) => ({ date: l.date, src: l.photo! }))

  return (
    <div className="space-y-6 pb-24 px-1">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Shape Evolution Hub</h2>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="aero-glass">
          <DialogHeader>
            <DialogTitle>Selecionar Imagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              className="w-full h-12 aero-button justify-start px-4"
              onClick={handleUploadNew}
            >
              <Camera className="mr-3 h-5 w-5" /> Nova Foto / Galeria
            </Button>

            {historyPhotos.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <History className="h-4 w-4" /> Histórico de Peso
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {historyPhotos.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary"
                      onClick={() => handleSelectImage(p.src)}
                    >
                      <img src={p.src} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 w-full bg-black/50 text-[10px] text-white text-center py-0.5">
                        {format(new Date(p.date), 'dd/MM')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="aero-glass p-2 md:p-6 rounded-[24px]">
        {/* Frame Container */}
        <div
          id="evolution-card"
          className="bg-gradient-to-br from-primary via-cyan-600 to-blue-700 p-4 rounded-[20px] shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Gloss */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/20 blur-3xl rounded-full" />

          {/* Header Branding */}
          <div className="text-center mb-4 relative z-10">
            <h3 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
              NutriFuel
            </h3>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
              Transformation
            </p>
          </div>

          <div className="flex gap-2 h-64 relative z-10">
            {/* Before */}
            <div
              className="flex-1 bg-black/20 rounded-l-xl overflow-hidden relative group cursor-pointer border-r border-white/20"
              onClick={() => handleSlotClick('before')}
            >
              {beforeImage ? (
                <img src={beforeImage} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 hover:bg-white/10 transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-xs font-bold">ANTES</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                ANTES
              </div>
            </div>

            {/* After */}
            <div
              className="flex-1 bg-black/20 rounded-r-xl overflow-hidden relative group cursor-pointer"
              onClick={() => handleSlotClick('after')}
            >
              {afterImage ? (
                <img src={afterImage} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 hover:bg-white/10 transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-xs font-bold">DEPOIS</span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-primary px-2 py-1 rounded text-[10px] font-bold text-white shadow-lg">
                DEPOIS
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-end relative z-10">
            <div className="text-white/90 text-[10px]">
              <p>#NutriFuelChallenge</p>
              <p>nutrifuel.app</p>
            </div>
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </div>

        <Button
          onClick={handleShare}
          className="w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white font-bold shadow-lg"
          disabled={!beforeImage || !afterImage}
        >
          <Share2 className="mr-2 h-5 w-5" /> Compartilhar Stories
        </Button>
      </div>
    </div>
  )
}
