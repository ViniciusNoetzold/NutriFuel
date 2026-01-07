import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface GlossyCardButtonProps {
  icon: LucideIcon
  title: string
  onClick?: () => void
  className?: string
}

export function GlossyCardButton({
  icon: Icon,
  title,
  onClick,
  className,
}: GlossyCardButtonProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glossy-icon-container cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 h-32 w-full group overflow-hidden',
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center gap-3 z-10 relative">
        <div className="p-3 bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-blue-300 dark:border-blue-500 group-hover:brightness-110 transition-all">
          <Icon
            className="h-7 w-7 text-white drop-shadow-md"
            strokeWidth={2.5}
          />
        </div>
        <span className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors text-shadow-sm">
          {title}
        </span>
      </div>

      {/* Internal Reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Highlight Flare */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none group-hover:translate-x-[-10px] group-hover:translate-y-[10px] transition-transform duration-700" />
    </div>
  )
}
