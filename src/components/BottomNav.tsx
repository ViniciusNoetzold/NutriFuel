import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Calendar, ShoppingCart, User, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()
  const path = location.pathname

  const items = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: Search, label: 'Receitas', href: '/recipes' },
    { icon: Calendar, label: 'Plano', href: '/plan' },
    { icon: ShoppingCart, label: 'Lista', href: '/shop' },
    { icon: Crown, label: 'Planos', href: '/plans' },
    { icon: User, label: 'Perfil', href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 aero-glass md:hidden pb-safe shadow-2xl">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const isActive = path === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full transition-all duration-300',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {/* Active Indicator Glow inside the bar */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/10 rounded-xl mx-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] animate-fade-in" />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <item.icon
                  className={cn(
                    'h-6 w-6 transition-transform duration-300 drop-shadow-sm',
                    isActive ? 'scale-110 fill-current/20' : 'scale-100',
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    'text-[10px] font-bold mt-0.5 transition-all duration-300',
                    isActive
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2 hidden',
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
