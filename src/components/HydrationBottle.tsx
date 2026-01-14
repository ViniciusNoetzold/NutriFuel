import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface HydrationBottleProps {
  current: number
  goal: number
  onAdd: (amount: number) => void
  onRemove: (amount: number) => void
}

export function HydrationBottle({
  current,
  goal,
  onAdd,
  onRemove,
}: HydrationBottleProps) {
  const percentage = Math.min(100, Math.max(0, (current / goal) * 100))
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [current])

  return (
    <Card className="aero-card border-0 bg-white/50 dark:bg-slate-900/50 overflow-hidden relative rounded-[24px] shadow-lg">
      <CardContent className="p-6 relative z-10 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500 p-2 rounded-full shadow-lg shadow-cyan-500/30 text-white animate-pulse-slow">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground leading-none">
                Hidratação
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Meta: {goal}ml
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {current}
              <span className="text-sm font-semibold text-muted-foreground ml-0.5">
                ml
              </span>
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {percentage.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Bottle Visualization */}
        <div className="relative h-64 w-full flex items-center justify-center py-4">
          <div className="relative w-32 h-full">
            <svg
              viewBox="0 0 100 220"
              className="w-full h-full drop-shadow-xl filter"
            >
              <defs>
                <clipPath id="bottleClip">
                  <path d="M25,0 L75,0 C80,0 85,2 85,10 L85,30 C85,40 95,50 95,70 L95,200 C95,215 85,220 50,220 C15,220 5,215 5,200 L5,70 C5,50 15,40 15,30 L15,10 C15,2 20,0 25,0 Z" />
                </clipPath>
                <linearGradient
                  id="waterGradient"
                  x1="0%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Bottle Outline/Background */}
              <path
                d="M25,0 L75,0 C80,0 85,2 85,10 L85,30 C85,40 95,50 95,70 L95,200 C95,215 85,220 50,220 C15,220 5,215 5,200 L5,70 C5,50 15,40 15,30 L15,10 C15,2 20,0 25,0 Z"
                fill="rgba(255, 255, 255, 0.2)"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="2"
                className="dark:fill-white/5 dark:stroke-white/20"
              />

              {/* Water Level */}
              <g clipPath="url(#bottleClip)">
                <motion.rect
                  x="0"
                  y={220 - (percentage / 100) * 220}
                  width="100"
                  height={(percentage / 100) * 220}
                  fill="url(#waterGradient)"
                  initial={{ y: 220, height: 0 }}
                  animate={{
                    y: 220 - (percentage / 100) * 220,
                    height: (percentage / 100) * 220,
                  }}
                  transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                />
                {/* Bubbles animation when filling */}
                <AnimatePresence>
                  {isAnimating && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <motion.circle
                          key={i}
                          cx={20 + Math.random() * 60}
                          cy={220 - (percentage / 100) * 220 + 20}
                          r={2 + Math.random() * 3}
                          fill="rgba(255,255,255,0.6)"
                          initial={{ opacity: 0, y: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            y: -40 - Math.random() * 40,
                          }}
                          transition={{
                            duration: 1,
                            ease: 'easeOut',
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </g>

              {/* Glass Reflections */}
              <path
                d="M20,10 L20,30 Q20,40 10,50"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M80,10 L80,30 Q80,40 90,50"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M15,80 Q15,150 15,190"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M85,80 Q85,150 85,190"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full mt-2">
          <Button
            className="flex-1 rounded-full h-12 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 dark:hover:bg-cyan-800/60 border-0 shadow-sm transition-all active:scale-95"
            onClick={() => onRemove(250)}
            disabled={current <= 0}
          >
            <Minus className="h-5 w-5" />
            <span className="sr-only">Remover 250ml</span>
          </Button>
          <Button
            className="flex-1 rounded-full h-12 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60 border-0 shadow-sm transition-all active:scale-95"
            onClick={() => onAdd(250)}
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">Adicionar 250ml</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
