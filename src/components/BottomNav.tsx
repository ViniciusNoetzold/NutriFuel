import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Calendar, User, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  isVisible: boolean
}

export function BottomNav({ isVisible }: BottomNavProps) {
  const location = useLocation()
  const path = location.pathname

  const items = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: Search, label: 'Receitas', href: '/recipes' },
    { icon: Calendar, label: 'Plano', href: '/plan' },
    { icon: TrendingUp, label: 'Registro de evolução', href: '/evolution' },
    { icon: User, label: 'Perfil', href: '/profile' },
  ]

  return (
    <nav
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 aero-glass md:hidden pb-safe shadow-2xl transition-transform duration-500 overflow-hidden',
        isVisible ? 'translate-y-0' : 'translate-y-[150%]',
      )}
    >
      <div className="flex h-16 items-center justify-around px-1 relative">
        {items.map((item) => {
          const isActive = path === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 group',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && (
                <div className="absolute inset-x-2 inset-y-1 bg-gradient-to-b from-white/40 to-transparent dark:from-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] animate-fade-in pointer-events-none" />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <item.icon
                  className={cn(
                    'h-6 w-6 transition-transform duration-300 drop-shadow-sm',
                    isActive ? 'scale-110 fill-current/20' : 'scale-100',
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
