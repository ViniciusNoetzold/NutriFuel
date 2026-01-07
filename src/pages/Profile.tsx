import { useAppStore } from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import {
  User,
  Sun,
  Moon,
  Camera,
  LogOut,
  TrendingUp,
  Trophy,
  Image as ImageIcon,
  X,
  Maximize2,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
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
import { format, subDays } from 'date-fns'
import { cn } from '@/lib/utils'

export default function Profile() {
  const { user, updateUser, logout, dailyLogs, logWeight, hasNewPR, resetPR } =
    useAppStore()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(user)
  const { setTheme, theme } = useTheme()
  const [avatarUrl, setAvatarUrl] = useState(user.avatar)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)

  // Weight & Photo State
  const [newWeight, setNewWeight] = useState('')
  const [weightPhoto, setWeightPhoto] = useState('')
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)

  // Celebration State
  const [showConfetti, setShowConfetti] = useState(false)

  // Chart Viewer State
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null)

  // Chart Data Preparation
  const historyData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const log = dailyLogs.find((l) => l.date === dateStr)

    return {
      date: format(date, 'dd/MM'),
      fullDate: dateStr,
      weight: log?.weight ?? null,
      photo: log?.photo,
    }
  })

  // Fill nulls for smooth line, but keep original for dots
  let lastWeight = user.weight
  const chartData = historyData.map((d) => {
    if (d.weight !== null) lastWeight = d.weight
    return { ...d, weight: lastWeight, originalWeight: d.weight }
  })

  useEffect(() => {
    if (hasNewPR) {
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
        resetPR()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [hasNewPR, resetPR])

  const handleUpdateWeight = () => {
    if (!newWeight) return
    const weightVal = parseFloat(newWeight)
    if (isNaN(weightVal) || weightVal <= 0) {
      toast.error('Insira um peso válido')
      return
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    logWeight(weightVal, today, weightPhoto)
    setNewWeight('')
    setWeightPhoto('')
    toast.success('Peso e progresso registrados!')
  }

  const handleSave = () => {
    updateUser(formData)
    toast.success('Perfil atualizado com sucesso!')
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = () => {
    handleChange('avatar', avatarUrl)
    setIsAvatarDialogOpen(false)
    toast.success('Foto atualizada!')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSimulatePhotoUpload = () => {
    const randomPhoto = `https://img.usecurling.com/ppl/medium?gender=${user.gender}&seed=${Math.random()}`
    setWeightPhoto(randomPhoto)
    setIsPhotoDialogOpen(false)
    toast.success('Foto carregada com sucesso!')
  }

  // Custom Dot to show photo indicator
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    if (payload.photo) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="hsl(var(--primary))"
          stroke="white"
          strokeWidth={2}
          className="cursor-pointer hover:scale-150 transition-transform duration-300"
          onClick={() => setViewingPhoto(payload.photo)}
        />
      )
    }
    return <Dot {...props} r={0} /> // Hide normal dots
  }

  return (
    <div className="space-y-8 pb-24 relative">
      {/* Celebration Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" />
          <div className="relative z-10 text-center animate-bounce">
            <Trophy className="h-32 w-32 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] mx-auto mb-4" />
            <h1 className="text-4xl font-extrabold text-white text-shadow-lg mb-2">
              NOVO RECORDE!
            </h1>
            <p className="text-white/90 text-xl font-medium">
              Você superou seus limites!
            </p>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
        <DialogContent className="aero-glass max-w-sm p-0 overflow-hidden border-0">
          <div className="relative aspect-square">
            <img
              src={viewingPhoto || ''}
              alt="Shape Evolution"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 text-white hover:bg-black/20 rounded-full"
              onClick={() => setViewingPhoto(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-bold text-lg text-shadow">Registro Visual</p>
              <p className="text-xs opacity-80">Evolução do Shape</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header Profile Section */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-300 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
          <Avatar className="h-32 w-32 border-4 border-white/50 shadow-2xl relative z-10">
            <AvatarImage src={formData.avatar} />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <Dialog
            open={isAvatarDialogOpen}
            onOpenChange={setIsAvatarDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg z-20 bg-white text-primary hover:bg-white/90 border border-black/10"
              >
                <Camera className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="aero-glass">
              <DialogHeader>
                <DialogTitle>Alterar Foto de Perfil</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Label>URL da Imagem</Label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="aero-input"
                  placeholder="https://..."
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setAvatarUrl(
                        `https://img.usecurling.com/ppl/medium?gender=${formData.gender}&seed=${Math.random()}`,
                      )
                    }
                  >
                    Gerar Aleatória
                  </Button>
                </div>
                <Button
                  onClick={handleAvatarChange}
                  className="w-full aero-button"
                >
                  Salvar Foto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-shadow">{formData.name}</h2>
          <Badge
            variant="secondary"
            className="mt-2 bg-white/30 backdrop-blur-md"
          >
            {formData.activityLevel}
          </Badge>
        </div>
      </div>

      <div className="aero-glass p-6 space-y-8">
        {/* Progress & Charts Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Evolução do Shape
            </h3>
          </div>

          {/* Weight & Photo Entry */}
          <div className="flex flex-col gap-3 p-4 bg-white/20 dark:bg-black/20 rounded-2xl border border-white/10 shadow-inner">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="weight-input" className="text-sm font-semibold">
                  Atualizar Peso (kg)
                </Label>
                <Input
                  id="weight-input"
                  placeholder={`${user.weight} kg`}
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  type="number"
                  step="0.1"
                  className="aero-input h-10 text-lg"
                />
              </div>

              {/* Photo Upload Trigger */}
              <Dialog
                open={isPhotoDialogOpen}
                onOpenChange={setIsPhotoDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className={cn(
                      'h-10 w-10 border-dashed border-2 transition-all',
                      weightPhoto
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/50 text-muted-foreground',
                    )}
                    title="Adicionar Foto do Shape"
                  >
                    {weightPhoto ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="aero-glass">
                  <DialogHeader>
                    <DialogTitle>Registro Visual</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4 text-center">
                    <div className="w-full aspect-square bg-black/10 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden group">
                      {weightPhoto ? (
                        <img
                          src={weightPhoto}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="ghost"
                          className="text-white"
                          onClick={handleSimulatePhotoUpload}
                        >
                          <Camera className="mr-2 h-4 w-4" /> Tirar Foto
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Adicione uma foto para acompanhar sua evolução visual no
                      gráfico.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Cole uma URL..."
                        className="aero-input"
                        value={weightPhoto}
                        onChange={(e) => setWeightPhoto(e.target.value)}
                      />
                      <Button
                        onClick={handleSimulatePhotoUpload}
                        variant="outline"
                      >
                        Simular
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleUpdateWeight}
                className="h-10 px-6 aero-button"
              >
                Salvar
              </Button>
            </div>
            {weightPhoto && (
              <div className="flex items-center gap-2 text-xs text-primary font-medium bg-primary/10 p-2 rounded-lg self-start">
                <ImageIcon className="h-3 w-3" /> Foto anexada
                <X
                  className="h-3 w-3 cursor-pointer ml-1 hover:text-red-500"
                  onClick={() => setWeightPhoto('')}
                />
              </div>
            )}
          </div>

          {/* Interactive Weight Chart */}
          <Card className="aero-card border-0 bg-white/40 dark:bg-black/40">
            <CardContent className="p-4 pt-6">
              <div className="h-[250px] w-full">
                <ChartContainer
                  config={{
                    weight: { label: 'Peso', color: 'hsl(var(--primary))' },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      onClick={(e) => {
                        if (e && e.activePayload && e.activePayload[0]) {
                          const payload = e.activePayload[0].payload
                          if (payload.photo) {
                            setViewingPhoto(payload.photo)
                          }
                        }
                      }}
                    >
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
                        dot={<CustomDot />}
                        activeDot={{
                          r: 6,
                          strokeWidth: 0,
                          className: 'animate-pulse',
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  Toque nos pontos marcados para ver a foto do shape.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-white/20" />

        {/* Theme Switcher */}
        <div className="flex items-center justify-between bg-gradient-to-br from-white/30 to-white/10 dark:from-white/10 dark:to-black/20 p-4 rounded-2xl border border-white/20 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-black/10 dark:bg-white/10">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </div>
            <span className="font-semibold text-base">Modo Ambiente</span>
          </div>

          <div
            className="relative w-16 h-8 bg-gray-200 dark:bg-gray-800 rounded-full shadow-inner cursor-pointer p-1 transition-colors border border-black/5 dark:border-white/5"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <div
              className={`w-6 h-6 rounded-full bg-gradient-to-b from-white to-gray-200 shadow-md transform transition-transform duration-300 ease-spring border border-white/50 ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}`}
            >
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-60" />
            </div>
          </div>
        </div>

        <Separator className="bg-white/20" />

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Dados Pessoais</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                className="aero-input"
                value={formData.age}
                onChange={(e) => handleChange('age', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gênero</Label>
              <Select
                value={formData.gender}
                onValueChange={(val) => handleChange('gender', val)}
              >
                <SelectTrigger className="aero-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                className="aero-input"
                value={formData.weight}
                onChange={(e) => handleChange('weight', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                className="aero-input"
                value={formData.height}
                onChange={(e) => handleChange('height', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <Button
          className="w-full text-lg h-14 aero-button mt-4 font-bold"
          onClick={handleSave}
        >
          Salvar Alterações
        </Button>

        <Button
          variant="ghost"
          className="w-full text-red-500 hover:bg-red-100/20 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>
    </div>
  )
}
