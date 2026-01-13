import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Share2,
  Upload,
  ArrowLeft,
  Camera,
  History,
  Plus,
  Loader2,
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
import { format } from 'date-fns'
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
  const [beforeImage, setBeforeImage] = useState<string | null>(null)
  const [afterImage, setAfterImage] = useState<string | null>(null)
  const [activeSlot, setActiveSlot] = useState<'before' | 'after' | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // New Entry State
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false)
  const [newWeight, setNewWeight] = useState(user.weight.toString())
  const [uploading, setUploading] = useState(false)
  const [cardPreviewOpen, setCardPreviewOpen] = useState(false)
  const [selectedLogForCard, setSelectedLogForCard] = useState<any>(null)

  // Image Editor
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
        const fileName = `${authUser.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('evolution')
          .upload(fileName, processedFile, {
            upsert: true,
            contentType: 'image/jpeg',
          })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('evolution').getPublicUrl(fileName)
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

  // Defensive programming: Ensure dailyLogs is an array
  const safeLogs = Array.isArray(dailyLogs) ? dailyLogs : []

  const historyPhotos = safeLogs
    .filter((l) => l.photo)
    .map((l) => ({ date: l.date, src: l.photo!, weight: l.weight }))

  // Chart Data from Daily Logs
  const chartData = safeLogs
    .filter((l) => typeof l.weight === 'number')
    .map((l) => ({
      date: format(new Date(l.date), 'dd/MM'),
      weight: l.weight!,
    }))

  return (
    <div className="space-y-6 pb-24 px-1">
      <ImageEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialFile={selectedFile}
        onSave={(file) => handleSaveEntry(file)}
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
                      <span className="text-xs">
                        Toque para selecionar e editar (1080x1080)
                      </span>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Weight Chart */}
          <Card className="aero-card border-0 bg-white/40 dark:bg-black/40">
            <CardContent className="p-4 pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> Histórico de Peso
              </h3>
              {chartData.length > 0 ? (
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
              ) : (
                <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground text-sm">
                  Nenhum dado de peso registrado.
                </div>
              )}
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
                        onClick={() => handleSelectImage(p.src)}
                      >
                        <img
                          src={p.src}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 w-full bg-black/50 text-[10px] text-white text-center py-0.5">
                          {format(new Date(p.date), 'dd/MM')}
                        </div>
                        {/* Share Button Overlay */}
                        <button
                          className="absolute top-1 right-1 p-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLogForCard(p)
                            setCardPreviewOpen(true)
                          }}
                        >
                          <Share2 className="h-3 w-3 text-white" />
                        </button>
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

          {/* Card Generator Modal - Story Card */}
          <Dialog open={cardPreviewOpen} onOpenChange={setCardPreviewOpen}>
            <DialogContent className="aero-glass border-0 bg-transparent shadow-none p-0 flex items-center justify-center">
              {selectedLogForCard && (
                <div className="relative w-80 aspect-[9/16] bg-gradient-to-br from-gray-900 to-black rounded-[32px] overflow-hidden shadow-2xl flex flex-col items-center justify-between p-6 border border-white/20">
                  <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/64/64?q=noise&color=gray')] opacity-10 pointer-events-none mix-blend-overlay" />

                  {/* Header */}
                  <div className="w-full flex justify-between items-center z-10">
                    <span className="font-bold text-white tracking-widest text-xs">
                      NUTRIFUEL
                    </span>
                    <span className="text-[10px] text-white/60">
                      {format(
                        new Date(selectedLogForCard.date),
                        'dd MMMM yyyy',
                      )}
                    </span>
                  </div>

                  {/* Photo */}
                  <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-lg my-4 group">
                    <img
                      src={selectedLogForCard.src}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <p className="text-3xl font-black text-white">
                        {selectedLogForCard.weight}
                        <span className="text-base font-normal text-white/60 ml-1">
                          kg
                        </span>
                      </p>
                      <p className="text-[10px] text-white/80 uppercase tracking-wider font-bold">
                        Progresso
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="w-full z-10">
                    <Button
                      className="w-full bg-white text-black hover:bg-white/90 rounded-full font-bold"
                      onClick={() =>
                        toast.success('Card pronto para compartilhar!')
                      }
                    >
                      Compartilhar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-white/50 text-xs mt-2"
                      onClick={() => setCardPreviewOpen(false)}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              )}
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
                    <img
                      src={beforeImage}
                      className="w-full h-full object-cover"
                    />
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
                    <img
                      src={afterImage}
                      className="w-full h-full object-cover"
                    />
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
              <Share2 className="mr-2 h-5 w-5" /> Compartilhar Comparativo
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
