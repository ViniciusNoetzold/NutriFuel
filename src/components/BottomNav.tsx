import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Search,
  Calendar,
  ShoppingCart,
  User,
  TrendingUp,
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()
  const path = location.pathname

  const items = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: Search, label: 'Receitas', href: '/recipes' },
    { icon: Calendar, label: 'Plano', href: '/plan' },
    { icon: ShoppingCart, label: 'Compras', href: '/shop' },
    { icon: TrendingUp, label: 'Progresso', href: '/progress' },
    { icon: Crown, label: 'Planos', href: '/plans' },
    { icon: User, label: 'Perfil', href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 aero-glass md:hidden pb-safe shadow-2xl overflow-x-auto">
      <div className="flex h-16 items-center justify-between px-2 min-w-max md:min-w-0 md:justify-around gap-2">
        {items.map((item) => {
          const isActive = path === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 rounded-2xl px-3 py-1 transition-all duration-300',
                isActive
                  ? 'text-primary -translate-y-2'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-full transition-all',
                  isActive
                    ? 'bg-gradient-to-br from-white/80 to-white/40 shadow-lg ring-2 ring-white/50'
                    : 'bg-transparent',
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5',
                    isActive && 'text-primary fill-current',
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              {isActive && (
                <span className="text-[10px] font-bold text-shadow">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
