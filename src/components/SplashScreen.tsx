import { useState, useEffect } from 'react'
import { InteractiveDumbbell } from '@/components/InteractiveDumbbell'

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true)
      setTimeout(onFinish, 800)
    }, 2000)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-1000 ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="animate-float">
        <InteractiveDumbbell />
      </div>
      <h1 className="text-4xl font-extrabold mt-6 tracking-tight text-metallic animate-fade-in-up">
        NutriFuel
      </h1>
      <p className="text-primary font-bold dark:text-cyan-400 text-sm mt-2 opacity-80 animate-fade-in-up delay-200">
        Seu corpo, seu combustível.
      </p>
    </div>
  )
}
