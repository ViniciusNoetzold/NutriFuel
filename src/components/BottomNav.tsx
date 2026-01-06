import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Search,
  Calendar,
  ShoppingCart,
  User,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()
  const path = location.pathname

  const items = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: Search, label: 'Receitas', href: '/recipes' },
    { icon: Calendar, label: 'Plano', href: '/plan' },
    { icon: ShoppingCart, label: 'Lista', href: '/shop' },
    { icon: TrendingUp, label: 'Progresso', href: '/progress' },
    { icon: User, label: 'Perfil', href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const isActive = path === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 rounded-lg px-2 py-1 transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <item.icon
                className={cn(
                  'h-6 w-6 transition-transform',
                  isActive && 'scale-110',
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
