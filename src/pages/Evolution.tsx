import { useState, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Share2,
  Upload,
  Camera,
  History,
  Plus,
  Loader2,
  Droplets,
  Moon,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores/useAppStore'
import {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { ImageEditor } from '@/components/ImageEditor'

export default function Evolution() {
  const navigate = useNavigate()
  const { dailyLogs, user, logWeight, isLoading } = useAppStore()
  const { user: authUser } = useAuth()

  // Before & After State
  const [beforeImage, setBeforeImage] = useState<{
    src: string
    date: string
    weight: number
  } | null>(null)
  const [afterImage, setAfterImage] = useState<{
    src: string
    date: string
    weight: number
  } | null>(null)
  const [activeSlot, setActiveSlot] = useState<'before' | 'after' | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // New Entry State
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false)
  const [newWeight, setNewWeight] = useState(user.weight.toString())
  const [uploading, setUploading] = useState(false)
  const [generatedBeforeAfter, setGeneratedBeforeAfter] = useState<
    string | null
  >(null)

  // Image Editor
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSlotClick = (slot: 'before' | 'after') => {
    setActiveSlot(slot)
    setIsDialogOpen(true)
  }

  const handleSelectImage = (log: any) => {
    const imageData = { src: log.photo!, date: log.date, weight: log.weight! }
    if (activeSlot === 'before') setBeforeImage(imageData)
    else setAfterImage(imageData)
    setIsDialogOpen(false)
    toast.success('Foto selecionada!')
  }

  const generateBeforeAfter = () => {
    if (!beforeImage || !afterImage) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High Res Output
    const w = 1200
    const h = 1350
    canvas.width = w
    canvas.height = h

    // Background
    ctx.fillStyle = '#1e293b' // Dark background
    ctx.fillRect(0, 0, w, h)

    // Load Images
    const img1 = new Image()
    img1.crossOrigin = 'anonymous'
    img1.src = beforeImage.src

    const img2 = new Image()
    img2.crossOrigin = 'anonymous'
    img2.src = afterImage.src

    let loaded = 0
    const draw = () => {
      loaded++
      if (loaded < 2) return

      // Draw Images side by side
      // Left Side
      ctx.drawImage(img1, 50, 200, 525, 700)
      // Right Side
      ctx.drawImage(img2, 625, 200, 525, 700)

      // Overlays
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(50, 800, 525, 100)
      ctx.fillRect(625, 800, 525, 100)

      // Text Labels
      ctx.fillStyle = 'white'
      ctx.font = 'bold 40px Inter, sans-serif'
      ctx.textAlign = 'center'

      // Dates
      ctx.fillText(format(new Date(beforeImage.date), 'dd/MM/yyyy'), 312, 850)
      ctx.fillText(format(new Date(afterImage.date), 'dd/MM/yyyy'), 887, 850)

      // Weights
      ctx.font = '30px Inter, sans-serif'
      ctx.fillText(`${beforeImage.weight}kg`, 312, 890)
      ctx.fillText(`${afterImage.weight}kg`, 887, 890)

      // Header Slogan
      ctx.font = 'bold 50px Inter, sans-serif'
      ctx.fillText('NUTRIFUEL', w / 2, 100)
      ctx.font = 'italic 30px Inter, sans-serif'
      ctx.fillStyle = '#38bdf8'
      ctx.fillText('Seu corpo, seu combustível.', w / 2, 150)

      // Generate URL
      setGeneratedBeforeAfter(canvas.toDataURL('image/png'))
    }

    img1.onload = draw
    img2.onload = draw
  }

  const downloadGenerated = () => {
    if (!generatedBeforeAfter) return
    const link = document.createElement('a')
    link.href = generatedBeforeAfter
    link.download = 'nutrifuel-evolucao.png'
    link.click()
    toast.success('Imagem salva!')
  }

  const handleShare = async () => {
    if (!beforeImage || !afterImage) return
    generateBeforeAfter()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setEditorOpen(true)
    }
  }

  const handleSaveEntry = async (processedFile?: File) => {
    if (!newWeight) {
      toast.error('Informe o peso atual.')
      return
    }

    setUploading(true)
    let photoUrl = undefined

    try {
      if (processedFile && authUser) {
        const fileExt = 'jpg'
        const fileName = `${authUser.id}/evolution/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, processedFile, {
            upsert: true,
            contentType: 'image/jpeg',
          })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(fileName)
        photoUrl = publicUrl
      }

      await logWeight(
        Number(newWeight),
        format(new Date(), 'yyyy-MM-dd'),
        photoUrl,
      )
      toast.success('Registro adicionado com sucesso!')
      setIsNewEntryOpen(false)
      setSelectedFile(null)
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // Filter logs by month and FILL GAPS
  const safeLogs = Array.isArray(dailyLogs) ? dailyLogs : []
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const chartData = useMemo(() => {
    let lastKnownWeight =
      safeLogs
        .filter((l) => l.date < format(monthStart, 'yyyy-MM-dd') && l.weight)
        .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight ||
      user.weight ||
      0 // Fallback to current profile weight

    return allDays.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const log = safeLogs.find((l) => l.date === dateStr)

      // Logic: If Wt is null, Wt = Wt-1 (carry forward)
      if (log?.weight) {
        lastKnownWeight = log.weight
      }

      return {
        date: format(day, 'dd/MM'),
        weight: lastKnownWeight > 0 ? lastKnownWeight : null,
      }
    })
  }, [allDays, safeLogs, user.weight, monthStart])

  const waterChartData = allDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const log = safeLogs.find((l) => l.date === dateStr)
    return {
      date: format(day, 'dd/MM'),
      ml: log?.waterIntake || 0,
    }
  })

  const sleepChartData = allDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const log = safeLogs.find((l) => l.date === dateStr)
    return {
      date: format(day, 'dd/MM'),
      hours: log?.sleepHours || 0,
    }
  })

  const historyPhotos = safeLogs
    .filter((l) => l.photo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  return (
    <div className="space-y-6 pb-24 px-1">
      <ImageEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialFile={selectedFile}
        onSave={(file) => handleSaveEntry(file)}
        mask="rect"
      />

      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Evolução</h2>
          </div>
          <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="aero-button rounded-full">
                <Plus className="h-4 w-4 mr-2" /> Registrar
              </Button>
            </DialogTrigger>
            <DialogContent className="aero-glass">
              <DialogHeader>
                <DialogTitle>Novo Registro</DialogTitle>
                <DialogDescription>
                  Registre seu peso e uma foto para acompanhar sua jornada.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Peso Atual (kg)</Label>
                  <Input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="aero-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Foto (Opcional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="photo-upload"
                      onChange={handleFileSelect}
                    />
                    <Label
                      htmlFor="photo-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-white/40 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Camera className="h-8 w-8 mb-2" />
                        <span className="text-xs">Toque para selecionar</span>
                      </div>
                    </Label>
                  </div>
                </div>
                <Button
                  className="w-full aero-button"
                  onClick={() => handleSaveEntry()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Share2 className="h-4 w-4 mr-2" />
                  )}
                  Salvar sem Foto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between aero-glass p-2 rounded-xl mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-bold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Weight Chart - Scrollable HD */}
          <Card className="aero-card border-0 bg-white/40 dark:bg-black/40 overflow-hidden">
            <CardContent className="p-4 pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> Histórico de Peso
              </h3>
              <div className="overflow-x-auto pb-4">
                <div className="h-[300px] min-w-[800px]">
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
                        <YAxis
                          domain={['auto', 'auto']}
                          hide={false}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                          fontSize={10}
                          stroke="currentColor"
                          opacity={0.5}
                        />
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
              </div>
            </CardContent>
          </Card>

          {/* Water Chart - Scrollable HD */}
          <Card className="aero-card border-0 bg-cyan-50/50 dark:bg-cyan-900/20 overflow-hidden">
            <CardContent className="p-4 pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-cyan-500" /> Hidratação
              </h3>
              <div className="overflow-x-auto pb-4">
                <div className="h-[300px] min-w-[800px]">
                  <ChartContainer
                    config={{
                      ml: { label: 'ml', color: '#06b6d4' },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={waterChartData}>
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
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="ml"
                          fill="#06b6d4"
                          radius={[8, 8, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sleep Chart - Scrollable HD */}
          <Card className="aero-card border-0 bg-indigo-50/50 dark:bg-indigo-900/20 overflow-hidden">
            <CardContent className="p-4 pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-500" /> Histórico de Sono
              </h3>
              <div className="overflow-x-auto pb-4">
                <div className="h-[300px] min-w-[800px]">
                  <ChartContainer
                    config={{
                      hours: { label: 'Horas', color: '#6366f1' },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sleepChartData}>
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
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="hours"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fillOpacity={0.2}
                          fill="#6366f1"
                          dot={{ fill: '#6366f1', r: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
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
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary group"
                        onClick={() => handleSelectImage(p)}
                      >
                        <img
                          src={p.photo}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 w-full bg-black/50 text-[10px] text-white text-center py-0.5">
                          {format(new Date(p.date), 'dd/MM')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Nenhuma foto no histórico.
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
                  Seu corpo, seu combustível.
                </p>
              </div>

              {generatedBeforeAfter ? (
                <div className="relative z-10 space-y-4">
                  <img
                    src={generatedBeforeAfter}
                    className="w-full rounded-xl shadow-lg border-2 border-white/20"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={downloadGenerated}
                      className="flex-1 bg-white text-primary hover:bg-white/90 font-bold"
                    >
                      <Download className="mr-2 h-4 w-4" /> Baixar
                    </Button>
                    <Button
                      onClick={() => setGeneratedBeforeAfter(null)}
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      Refazer
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 h-64 relative z-10">
                    <div
                      className="flex-1 bg-black/20 rounded-l-xl overflow-hidden relative group cursor-pointer border-r border-white/20"
                      onClick={() => handleSlotClick('before')}
                    >
                      {beforeImage ? (
                        <img
                          src={beforeImage.src}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 hover:bg-white/10 transition-colors">
                          <Upload className="h-8 w-8 mb-2" />
                          <span className="text-xs font-bold">ANTES</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                        {beforeImage
                          ? format(new Date(beforeImage.date), 'dd/MM/yy')
                          : 'ANTES'}
                      </div>
                    </div>

                    <div
                      className="flex-1 bg-black/20 rounded-r-xl overflow-hidden relative group cursor-pointer"
                      onClick={() => handleSlotClick('after')}
                    >
                      {afterImage ? (
                        <img
                          src={afterImage.src}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 hover:bg-white/10 transition-colors">
                          <Upload className="h-8 w-8 mb-2" />
                          <span className="text-xs font-bold">DEPOIS</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-primary px-2 py-1 rounded text-[10px] font-bold text-white shadow-lg">
                        {afterImage
                          ? format(new Date(afterImage.date), 'dd/MM/yy')
                          : 'DEPOIS'}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleShare}
                    className="w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white font-bold shadow-lg"
                    disabled={!beforeImage || !afterImage}
                  >
                    <Share2 className="mr-2 h-5 w-5" /> Gerar Comparativo
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
