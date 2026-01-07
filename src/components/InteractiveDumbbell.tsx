import { useState, useRef, useEffect } from 'react'
import { Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InteractiveDumbbell() {
  const [isFalling, setIsFalling] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const [relPos, setRelPos] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFalling) return
    setIsDragging(true)
    if (dragRef.current) {
      // Calculate relative position of mouse inside the element
      const rect = dragRef.current.getBoundingClientRect()
      setRelPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isFalling) {
      setPosition({
        x: e.clientX - relPos.x,
        y: e.clientY - relPos.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouch = () => {
    // Gravity effect on tap (mobile mostly)
    if (!isDragging) {
      setIsFalling(true)
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, relPos])

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      onClick={handleTouch}
      style={{
        transform: isDragging
          ? `translate(${position.x}px, ${position.y}px)`
          : isFalling
            ? 'translateY(150vh) rotate(720deg)'
            : 'translate(0, 0)',
        position: isDragging ? 'fixed' : 'relative',
        left: isDragging ? 0 : 'auto',
        top: isDragging ? 0 : 'auto',
        zIndex: 50,
      }}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-transform duration-1000 ease-in',
        !isDragging && !isFalling && 'animate-float',
      )}
    >
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Metallic Halo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-300 via-white to-gray-300 dark:from-gray-700 dark:via-gray-500 dark:to-gray-800 rounded-full blur-xl opacity-60" />

        {/* Metallic Orb */}
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-b from-gray-100 to-gray-400 dark:from-gray-600 dark:to-gray-900 shadow-[0_10px_20px_rgba(0,0,0,0.3),inset_0_2px_5px_rgba(255,255,255,0.9)] border border-white/60 dark:border-white/20 flex items-center justify-center">
          {/* Specular Highlight */}
          <div className="absolute top-2 left-5 w-12 h-6 bg-gradient-to-b from-white to-transparent rounded-full opacity-90 blur-[1px]" />

          <Dumbbell className="h-14 w-14 text-gray-700 dark:text-gray-200 drop-shadow-md z-10" />
        </div>
      </div>
    </div>
  )
}
