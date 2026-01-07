import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { toast } from 'sonner'
import { TrendingUp, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Progress() {
  const { user, dailyLogs, logWeight, hasNewPR, resetPR } = useAppStore()
  const [newWeight, setNewWeight] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  // Trigger celebration
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

  const historyData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const log = dailyLogs.find((l) => l.date === dateStr)

    return {
      date: format(date, 'dd/MM'),
      weight: log?.weight ?? null,
    }
  })

  // Fill nulls for visual continuity (simple fill forward)
  let lastWeight = user.weight
  const chartData = historyData.map((d) => {
    if (d.weight !== null) lastWeight = d.weight
    return { ...d, weight: lastWeight }
  })

  const handleUpdateWeight = () => {
    if (!newWeight) return
    const weightVal = parseFloat(newWeight)
    if (isNaN(weightVal) || weightVal <= 0) {
      toast.error('Insira um peso válido')
      return
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    logWeight(weightVal, today)
    setNewWeight('')
    toast.success('Peso registrado!')
  }

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Celebration Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
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
          {/* Simple CSS Fireworks/Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-yellow-300 to-red-500 shadow-[0_0_10px_white]"
              style={{
                top: '50%',
                left: '50%',
                animation: `fireworks 1s ease-out forwards`,
                transform: `rotate(${i * 18}deg) translate(200px)`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold px-2">Monitoramento</h2>

      {/* Weight Entry */}
      <Card className="aero-glass border-white/40">
        <CardContent className="p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="weight-input" className="text-base font-semibold">
                Atualizar Peso (kg)
              </Label>
              <Input
                id="weight-input"
                placeholder={`${user.weight} kg`}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                type="number"
                step="0.1"
                className="aero-input h-12 text-lg"
              />
            </div>
            <Button
              onClick={handleUpdateWeight}
              className="h-12 px-8 aero-button"
            >
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weight Chart */}
      <Card className="aero-card bg-white/80 dark:bg-black/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-lg">Evolução de Peso</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
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
                        stopColor="var(--color-weight)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-weight)"
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
                    fontSize={12}
                    stroke="currentColor"
                    opacity={0.7}
                  />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-weight)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorWeight)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
