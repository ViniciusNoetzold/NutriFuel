import { useAppStore } from '@/stores/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { Moon, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { LineChart, Line, XAxis, ResponsiveContainer } from 'recharts'

export function SleepTracker() {
  const { dailyLogs, logSleep, user } = useAppStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLog = dailyLogs.find((l) => l.date === today)
  const hours = todayLog?.sleepHours || 0

  const handleSleep = (amount: number) => {
    logSleep(Math.max(0, hours + amount), today)
  }

  const chartData = dailyLogs
    .slice(-5)
    .map((log) => ({
      date: format(new Date(log.date), 'dd/MM'),
      hours: log.sleepHours || 0,
    }))
    .reverse()

  return (
    <Card className="aero-card border-0 bg-indigo-50/50 dark:bg-indigo-900/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-full shadow-lg shadow-indigo-500/30 text-white">
              <Moon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Sono</h3>
              <p className="text-xs text-muted-foreground font-medium">
                Meta: 8h
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
            {hours}h
          </span>
        </div>

        <div className="h-24 w-full mb-4">
          <ChartContainer
            config={{
              hours: { label: 'Horas', color: 'hsl(var(--primary))' },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="flex gap-4">
          <Button
            className="flex-1 aero-button hover:bg-indigo-200/50"
            variant="ghost"
            onClick={() => handleSleep(-1)}
          >
            <Minus className="mr-2 h-4 w-4" /> 1h
          </Button>
          <Button
            className="flex-1 aero-button hover:bg-indigo-200/50"
            variant="ghost"
            onClick={() => handleSleep(1)}
          >
            <Plus className="mr-2 h-4 w-4" /> 1h
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
