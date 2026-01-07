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
        'glossy-icon-container cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 h-32 w-full group',
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2 z-10 relative">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-primary rounded-full shadow-lg border-2 border-white/40 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-shadow">
          <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors text-shadow">
          {title}
        </span>
      </div>

      {/* Highlight Flare */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-full blur-xl -translate-y-10 translate-x-10 pointer-events-none" />
    </div>
  )
}
