import { useState } from 'react'
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
  BarChart,
  Bar,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { toast } from 'sonner'

export default function Progress() {
  const { user, dailyLogs, getDailyNutrition, logWeight } = useAppStore()
  const [newWeight, setNewWeight] = useState('')

  // Generate chart data from real dailyLogs
  const historyData = Array.from({ length: 7 })
    .map((_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const nut = getDailyNutrition(dateStr)
      const log = dailyLogs.find((l) => l.date === dateStr)

      // For visualization purposes, if no data exists, we might want to show previous known weight or gap
      // Here we will show null if no weight to break the line or user current weight as fallback

      return {
        date: format(date, 'dd/MM'),
        calories: nut.calories,
        weight: log?.weight || null, // null will break line which is correct, or use user.weight for continuity
        water: log?.waterIntake || 0,
      }
    })
    .map((d) => ({ ...d, weight: d.weight ?? user.weight })) // Fallback to current weight for chart continuity if needed, or better logic

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
    toast.success('Peso atualizado!')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Seu Progresso</h2>

      {/* Weight Entry */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="weight-input">Atualizar Peso (kg)</Label>
              <Input
                id="weight-input"
                placeholder={user.weight.toString()}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                type="number"
                step="0.1"
              />
            </div>
            <Button onClick={handleUpdateWeight}>Salvar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Weight Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Evolução de Peso (kg)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ChartContainer
              config={{
                weight: { label: 'Peso', color: 'hsl(var(--primary))' },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-weight)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-weight)' }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Calories Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Consumo Calórico Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ChartContainer
              config={{
                calories: { label: 'Calorias', color: 'hsl(var(--secondary))' },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="calories"
                    fill="var(--color-calories)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
