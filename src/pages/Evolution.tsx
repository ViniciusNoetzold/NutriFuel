import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Upload, ArrowLeft, Camera, History, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores/useAppStore'
import { format, subDays } from 'date-fns'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Dot,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

export default function Evolution() {
  const navigate = useNavigate()
  const { dailyLogs, user } = useAppStore()
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

  const handleShare = () => {
    toast.success('Card gerado! Compartilhando...')
  }

  const historyPhotos = dailyLogs
    .filter((l) => l.photo)
    .map((l) => ({ date: l.date, src: l.photo! }))

  // Chart Data
  const historyData = Array.from({ length: 14 }).map((_, i) => {
    const date = subDays(new Date(), 13 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const log = dailyLogs.find((l) => l.date === dateStr)
    return {
      date: format(date, 'dd/MM'),
      weight: log?.weight ?? null,
    }
  })

  // Fill nulls
  let lastWeight = user.weight
  const chartData = historyData.map((d) => {
    if (d.weight !== null) lastWeight = d.weight
    return { ...d, weight: lastWeight }
  })

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
        <h2 className="text-2xl font-bold">Registro de evolução</h2>
      </div>

      {/* Weight Chart */}
      <Card className="aero-card border-0 bg-white/40 dark:bg-black/40">
        <CardContent className="p-4 pt-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Histórico de Peso
          </h3>
          <div className="h-[250px] w-full">
            <ChartContainer
              config={{
                weight: { label: 'Peso', color: 'hsl(var(--primary))' },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="colorWeight"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    opacity={0.2}
                    stroke="currentColor"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={10}
                    stroke="currentColor"
                    opacity={0.7}
                  />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorWeight)"
                    animationDuration={1500}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Tool */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="aero-glass">
          <DialogHeader>
            <DialogTitle>Selecionar Imagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {historyPhotos.length > 0 ? (
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
            ) : (
              <p className="text-center text-muted-foreground">
                Nenhuma foto no histórico. Adicione no seu perfil!
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="aero-glass p-2 md:p-6 rounded-[24px]">
        <div
          id="evolution-card"
          className="bg-gradient-to-br from-primary via-cyan-600 to-blue-700 p-4 rounded-[20px] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/20 blur-3xl rounded-full" />
          <div className="text-center mb-4 relative z-10">
            <h3 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
              NutriFuel
            </h3>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
              Transformation
            </p>
          </div>

          <div className="flex gap-2 h-64 relative z-10">
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
