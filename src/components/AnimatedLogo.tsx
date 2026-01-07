import { Dumbbell } from 'lucide-react'

export function AnimatedLogo() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />

      {/* Liquid Orb */}
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white to-primary/20 backdrop-blur-md border border-white/50 shadow-2xl flex items-center justify-center overflow-hidden animate-float">
        {/* Inner Liquid Wave */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 bg-primary/20 animate-liquid"
          style={{ borderRadius: '40% 40% 0 0' }}
        />

        {/* Icon */}
        <div className="relative z-10 bg-gradient-to-br from-primary to-blue-600 p-3 rounded-xl shadow-lg border-2 border-white/40">
          <Dumbbell className="h-10 w-10 text-white drop-shadow-md" />
        </div>

        {/* Gloss Shine */}
        <div className="absolute top-2 left-4 w-10 h-5 bg-white/40 rounded-full blur-[2px] -rotate-12" />
      </div>
    </div>
  )
}
