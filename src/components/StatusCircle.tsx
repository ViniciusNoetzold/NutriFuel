import { Flame } from 'lucide-react'

interface StatusCircleProps {
  remainingCalories: number
  protein: number
  carbs: number
  fats: number
}

export function StatusCircle({
  remainingCalories,
  protein,
  carbs,
  fats,
}: StatusCircleProps) {
  return (
    <div className="flex justify-center py-6 relative">
      <div className="relative w-72 h-72 flex items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/40 shadow-2xl">
        {/* Pulsing Animation Layer */}
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-slow" />
        <div className="absolute inset-4 rounded-full border-2 border-white/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2">
          <div className="mb-1 p-2 bg-gradient-to-br from-orange-400 to-red-600 rounded-full shadow-[0_4px_12px_rgba(249,115,22,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-white/40 backdrop-blur-sm">
            <Flame className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-cyan-700 dark:to-cyan-400 drop-shadow-sm leading-none">
              {Math.max(0, Math.floor(remainingCalories))}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Kcal Restantes
            </p>
          </div>

          {/* Macro Hierarchy */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {Math.round(protein)}g
              </span>
              <span className="text-[8px] uppercase font-bold text-muted-foreground">
                Prot
              </span>
            </div>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {Math.round(carbs)}g
              </span>
              <span className="text-[8px] uppercase font-bold text-muted-foreground">
                Carb
              </span>
            </div>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                {Math.round(fats)}g
              </span>
              <span className="text-[8px] uppercase font-bold text-muted-foreground">
                Gord
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
