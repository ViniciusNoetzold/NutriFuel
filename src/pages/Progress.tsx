import { useAppStore } from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Progress() {
  const { user, dailyLogs, getDailyNutrition } = useAppStore()

  // Generate mock history data for charts
  const historyData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const nut = getDailyNutrition(dateStr)
    const log = dailyLogs.find((l) => l.date === dateStr)

    // Mock random data if empty for visualization
    const calories = nut.calories || Math.floor(Math.random() * 500 + 1800)
    const weight = log?.weight || user.weight + (Math.random() * 1 - 0.5)

    return {
      date: format(date, 'dd/MM'),
      calories,
      weight: Number(weight.toFixed(1)),
      water: log?.waterIntake || Math.floor(Math.random() * 2000),
    }
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Seu Progresso</h2>

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
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-weight)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-weight)' }}
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
